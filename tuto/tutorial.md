# Comment développer une application Ethereum ?

Dans ce tutoriel, nous allons voir comment développer une application couplée à la blockchain Ethereum.

Mise à jour : 03/05/2019

## Introduction

Ethereum permet la création de **smart contracts**. Ce sont des programmes qui sont envoyés à tous les noeuds du réseau et dont on active des fonctionnalités au moyen de transactions.
Ils vont donc s'exécuter sur tous les noeuds dès que ces derniers recevront la transaction correspondante.

Les smart contracts sont écrits en **Solidity**, un langage créé pour Ethereum. Ils sont exécutés dans l'**EVM (Ethereum Virtual Machine)**. C'est une **machine virtuelle à pile d'exécution** présente sur chaque noeud Ethereum. C'est à dire que le programme est décompoé en une suite d'instructions de base, placées sur une pile, et exécutées dans l'ordre de dépilage.

La documentation officielle du langage est disponible ici : 
https://solidity.readthedocs.io/en/latest/

Il est ensuite possible de connecter une application traditionnelle à un smart contract.

## Mise en garde

Il faut garder à l'esprit que l'état de l'environnement d'exécution peut varier d'un noeud à l'autre. Par exemple, selon qu'un autre transaction ait déjà été reçu ou pas encore par tel ou tel noeud. La conception des smart contracts ne doit donc pas être dépendante de l'environnement.

Ensuite, comme tout élément stocké sur la blockchain, une fois validés, ils sont immuables. C'est à dire qu'il est impossible de mettre à jour ou supprimer un smart contract. D'où l'importance de mettre l'accent sur la qualité lors des développement.

Une mise à jour de smart contract équivaut au déploiement d'un nouveau smart contract. L'ancien restera toujours présent, avec ses données. Il pourra cependant être désactivé, mais ne sera jamais complètement supprimé.

## DApp ?

Une DApp, ou **Decentralized Application**, application décentralisée, est une application déployée sur un réseau de façon uniforme et partagée, qui ne possède aucun élément central et nécessaire à son fonctionnement.

Une application reposant uniquement sur des smart contracts déployés sur une blockchain est donc une DApp. La coupler à une application NodeJS ou autre, déployée sur un serveur, hors de la blockchain, revient à créer un Single Point Of Failure. De ce fait, il ne s'agit plus réellement d'une DApp.


## Description du projet

Dans ce projet, nous allons créer un simple HelloWorld.

Dans un premier temps, il se composera d'un simple smart contract, contenant une propriété, le nom de la personne à saluer, aisni que deux fonctions permettant de mettre à jour ce nom et de le récupérer.
Ensuite, nous créerons une applications Node.js qui affichera ce nom et proposera un formulaire pour le mettre à jour. Ces deux éléments seront liés aux fonctions du smart contract.

Dans un seconds temps, nous transformerons notre HelloWorld en service payant. La mise à jour du nom impliquera le paiement d'un certain tarif.
Le propriétaire du smart contract pourra alors récupérer quand il le souhaite l'intégralité des sommes que les utilisateurs auront payées.

Techniquement, nous aborderons la création, le test et le déploiement d'un smart contract. Puis la connection d'un application Node.js à un smart contract et l'envoi de transactions à celui-ci.


## Environnement

L'environnement d'exécution de ce tutorial se fera sous Linux, mais il est possible de trouver l'équivalent de chaque commande sous Windows ou Mac.

Ce tutorial sera basé sur Node.js. Il s'agit simplement de la technologie la plus répandue pour travailler avec les smart contracts, celle pour laquelle on trouve le plus d'outils et de frameworks disponibles.
Mais il est possible de trouver également des frameworks Java, Python ... qui fonctionnent de la même façon.

Nous allons dans un premier temps installer un certain nombre d'outils :

- Node.js : car le projet sera développé en Node.js :)

- Ganache : une blockchain de test, qui s'exécute en local et fournit une interface visuelle pour voir ce qu'il s'y passe.

https://truffleframework.com/ganache

- Truffle : un outil permettant de compiler, tester et déployer des smart contracts sur une blockchain.

https://truffleframework.com/truffle

- Web3.js : un framework javascript permettant d'interagir avec une blockchain.

https://web3js.readthedocs.io/en/1.0/index.html

Web3.js existe en version 0.20.X, qui est la version stable actuelle, et en version 1.0.X qui est encore en beta.
La version 0.20 permet une utilisation directement intégrée à des pages web, dans un navigateur. Elle est plus simple d'utilisation, mais sera prochainement dépréciée.
La version 1.0.X, bien que beta, a un bon niveau de stabilité et est bien plus complète. Cependant, elle impose un fonctionnement côté serveur, tel que Node.js.

Nous allons utiliser la version 1.0 pour ce tutorial.

***

**Vous êtes prêts ? Alors allons-y !**

***
**Sommaire**
1. [Initialisation de l'espace de travail](#1)
2. [Premier smart contract](#2)
3. [Test du smart contract](#3)
4. [Déploiement du smart contract](#4)
5. [Initialisation de l'application web](#5)
6. [Modification de la valeur](#6)
7. [Les événements](#7)
8. [Rendre la modification payante](#8)
9. [Administrer le contract](#9)
10. [Envoyer une transaction signée](#10)
11. [Ajouter un oracle](#11)
12. [Tests automatiques](#12)
13. [Ressources](#links)

***

## 1. Initialisation de l'espace de travail<a name="1"></a>

Dans un terminal, positionnez vous dans votre répertoire de travail, et lancez la commande suivante :

 ```truffle init```
 
Après une courte phase de téléchargement et d'initialisation, nous voyons apparaitre 3 répertoires et 1 fichier :
 
```contracts``` : code des smart contracts

```migrations``` : scripts permettant à Truffle de gérer les déploiements

```tests``` : scripts de tests unitaires des smart contracts

```truffle-config.js``` : fichier de configuration de Truffle

Dans certains de ces répertoires, des fichiers ```*migration*``` on été créés. Ils sont nécessaires à Truffle pour les déploiements de contrats, il ne faut pas les supprimer.

## 2. Premier smart contract<a name="2"></a>

Dans ```contracts```, créer un fichier Hello.sol. Y saisir le code suivant :

```
pragma solidity ^0.5.0;

contract Hello {

    string private name;

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public {
        name = newName;
    }

    function getName() public view returns (string memory) {
        return name;
    }
}

```

Etudions ce que nous venons d'écrire.

```pragma solidity ^0.5.0;``` décrit la version du compilateur que nous utilisons. Solidity est encore un langage qui évolue beaucoup et pour lequel il risque d'y avoir beaucoup d'incompatibilités entre les versions tant qu'il ne sera pas complètement stabilisé. Pouvoir choisir une version de compilateur permet donc de ne pas avoir à mettre à jour son code trop souvent. (Il est tout de même conseillé de le faire régulièrement pour bénéficier des améliorations de sécurité.)

Ensuite nous déclarons le contrat en indiquant son nom et en lui créant un champ privé de type chaine de caractères.

Ce contrat possède un constructeur, qui initialise son champ avec la valeur "nobody", ainsi qu'un getter et un setter pour modifier et accéder à ce champ.

Notez l'utilisation de certains mots clés :

```memory``` : indique que la valeur de cette variable (```newName```) est stockée en mémoire uniquement et non dans la blockchain. Elle n'occasionnera donc aucun coût de stockage, contrairement au champ ```name```.

```view``` : indique que cette fonction ne modifie pas l'état de la blockchain car elle ne fait que retourner une valeur. Elle n'occasionnera elle non plus aucun coût et peut donc être appelée gratuitement, contrairement à ```setName```, dont l'appel devra se faire via une transaction payante.

```returns (string memory)``` : indique le type de retour de la fonction. Là encore, il faut préciser que la donnée retournée ne transitera que par la mémoire et non par le stockage sur la blockchain.

Maintenant, tapez la commande suivante :

```truffle compile```

Si la compilation se termine avec succès, un répertoire ```build/contracts``` vient d'être créé. Il contient les résultats de la compilation. C'est dans ce répertoire que nous trouverons les **ABI** (Application Binary Interface). Il s'agit des contrats de service, définis en json, que notre application aura besoin de connaitre pour pouvoir interagir avec le smart contract. Nous verrons cela par la suite.


## 3. Test du smart contract<a name="3"></a>

Avant de déployer notre smart contract, nous allons le tester en utilisant Remix. C'est un IDE en ligne qui remplit à peu près le même rôle que Truffle. C'est l'occasion de tester un nouvel outil :).

https://remix.ethereum.org


## 4. Déploiement du smart contract<a name="4"></a>

Tout d'abord, lancez Ganache (ou tout autre client Ethereum).

Nous allons modifier le fichier ```truffle-config.js``` pour indiquer à Truffle les paramètres de connexion :

```
module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  }
};
```

Nous indiquons qu'il existe un réseau, que nous nommons **ganache**, et qui disponible sur 127.0.0.1:7545 (IP/Port par défaut de Ganache, adaptez au besoin).
Il est possible de définir plusieurs réseaux, et de préciser dans la ligne de commande lequel utiliser. Le premier sera utilisé par défaut si rien n'est indiqué.

Dans le répertoire ```migrations``` dupliquez le fichier ```1_initial_migration.js``` en le nommant ```2_hello_migration.js```. Modifiez le contenu de ce nouveau fichier de cette façon :

```
const Hello = artifacts.require("Hello");

module.exports = function(deployer) {
  deployer.deploy(Hello);
};
```

Le paramètre du ```require``` doit être le nom du contrat tel que défini dans le fichier Hello.sol.


Maintenant, tapez la commande suivante :

```truffle deploy```

Vous devez obtenir le résultat suivant :

![Résultat du déploiement](images/1-deploy-result.png)

Vous obtenez différentes informations sur la transaction qui a déployé le contrat (numéro de transaction, prix ...).
Notez bien pour plus tard l'information la plus importante, l'adresse à laquelle le smart contract a été déployé ("contract address").

## 5. Initialisation de l'application web<a name="5"></a>

### 1.1 Création des fichiers

Nous allons initialiser une application web, basée sur Node.js, utilisant les framework Express pour MVC et Pug pour les templates HTML.
Dans un premier temps, nous allons créer une simple page d'index qui affiche des informations sur le noeud de blockchain auquel nous sommes connectés.

Nous allons créer plusieurs répertoires et fichiers :
- ```src/``` : pour contenir les sources de notre application web
- ```src/views``` : pour les templates des écrans
- ```src/views/index.pug``` : le template de l'index
- ```src/app.js``` : le contrôleur de l'application
- ```src/payablehello.js``` : les services de connexion à la blockchain
- ```src/config.js``` : la configuration de notre application

Placez-vous dans le répertoire ```src``` et initialisez le projet Node.js avec la commande

```npm init```

Saisissez les quelques informations demandées pour initialiser le projet.

Nous allons maintenant installer les packages nécessaires.

```npm install pug```

```npm install express```

```npm install web```

1ère étape, se connecter à la blockchain au moyen de web3.

**_config.js :_**

```javascript
const config = {

	// blockchain node IPC IP and port
	nodeURL: "http://127.0.0.1",
	nodePort: 7545,

	// default account address
	account:"0x1234567890abcdef......",

	// ABI file of smart contract
	abiFile:"../build/contracts/PayableHello.json",
	
	// address of deployed contract on blockchain
	payableHelloContractAddress:"0x1234567890abcdef......"	

};

module.exports = config;
```

Initialiser les valeurs 
- ```nodeURL``` et ```nodePort``` : éléments de connexion à Ganache
- ```account``` : adresse Ethereum du premier compte disponible sur Ganache,
- ```abiFile``` : chemin du fichier PayableHello.json dans le répertoire ```build``` généré par Truffle.
- ```payableHelloContractAddress``` : adresse à laquelle le contrat a été déployé avec Truffle. ("contract address" dans le résultat de ```truffle deploy```)


### 1.2 Connection à la blockchain

**_payablehello.js :_**

```
var Web3 = require("web3");
var fs = require('fs');
var config = require("./config.js");

var exports = module.exports = {};

var payableHello = null; // contract methods
var web3 = null;

/*
* Connect to blockchain
*/
exports.connection = function() {

	const options = {
		defaultAccount: config.account
	}

	web3 = new Web3(Web3.givenProvider || config.nodeURL+':'+config.nodePort, null, options);
	console.log("Connected to "+config.nodeURL+':'+config.nodePort);
}

/*
* Get connection info
*/
exports.getNodeInfo = async function() {

	var nodeInfo = {
		web3Version:  web3.version
	};

	// get all blockchain info from current node
	nodeInfo.blockNumber = await web3.eth.getBlockNumber();
	nodeInfo.coinbase = await web3.eth.getCoinbase();
	nodeInfo.node = await web3.eth.getNodeInfo();
	nodeInfo.balance = web3.utils.fromWei(await web3.eth.getBalance(config.account), 'ether');
	nodeInfo.contractBalance = web3.utils.fromWei(await web3.eth.getBalance(config.payableHelloContractAddress), 'ether');

	return nodeInfo;

}
```

### 1.3 Connection au contrat

Nous allons maintenant nous connecter au contrat :

**_payablehello.js :_**

```
/*
* Load contract's methods with ABI
*/
exports.initContracts = function() {

	// read ABI from file
	var parsed = JSON.parse(fs.readFileSync(config.abiFile));
	var payableHelloWorldABI = parsed.abi;

	// load contracts methods at contract address, using ABI
	payableHello = new web3.eth.Contract(payableHelloWorldABI, config.payableHelloContractAddress);

}
```

Cette fonction récupère l'objet javascript ABI dans le fichier json et le passe en paramètre, avec l'adresse du smart contract déployé, à la méthode ```web3.eth.Contract```, qui va retourner un object javascript permettant d'interagir avec le smart contract.

L'objet ```payableHello``` sera donc notre objet d'accès au contrat.

Nous pouvons initialiser notre template (on intègre Bootstrap pour faciliter la mise en forme) :

**_index.pug :_**
```
doctype html
html(lang='fr')
	head
		meta(charset='utf-8')
		title Ethereum Hello world
		script(type='text/javascript', src='https://code.jquery.com/jquery-3.3.1.slim.min.js')
		script(type='text/javascript', src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js')
		script(type='text/javascript', src='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js')
		link(rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css')
	body
	.container-fluid
		.row
			.col-md-6
				div.card
					h3.card-header Blockchain info
					div.card-body
						#info
							br
							div
								b Web3 version :&nbsp;
								span#web3-version #{nodeInfo.web3Version}
							div
								b Node :&nbsp;
								span#node #{nodeInfo.node}
							div
								b Last block :&nbsp;
								span#block-number #{nodeInfo.blockNumber}
							div
								b Coinbase :&nbsp;
								span#coinbase #{nodeInfo.coinbase}
							div
								b Balance :&nbsp;
								span#balance #{nodeInfo.balance}
							div
								b Contract balance :&nbsp;
								span#contract-balance #{nodeInfo.contractBalance}
```

Et pour lier tout ça, notre contrôleur, **_app.js :_**

```
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var stringify = require('json-stringify-safe');
var config = require("./config.js");
var payableHello = require('./payablehello'); // app services

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))


// object containing data to display on index page
var displayData = {};
displayData.nodeInfo = null;
displayData.name = null;
displayData.txStatus = null;
displayData.blockNumber = null;
displayData.withdrawStatus = null;
displayData.nameHistory = null;
displayData.paymentHistory = null;
displayData.withdrawHistory = null;
displayData.errorMessage = null;
displayData.accounts = config.accounts;


/*
* 
*/
async function renderIndex(res) {

	try {
		// get blockchain node's information
		displayData.nodeInfo = await payableHello.getNodeInfo();
	}
	catch(error) {
		console.error(error);
	}

	res.render('index', displayData);
}

/*
* Display home page
*/
app.get('/', async function(req, res) {
	renderIndex(res);
});


// init blockchain connection
payableHello.connection();
payableHello.initContracts();

// start server
app.listen(3000);

```

On définit une route GET "/", qui affichera l'index, puis on appelle les méthodes définies précédemment pour se connecter à la blockchain et au contrat. Enfin, on lance l'application sur le port 3000 de localhost.

Nous avons maintenant tout ce qu'il faut pour lancer la première version de notre application, qui va :
- se connecter à la blockchain
- se connecter au smart contract
- afficher un certain nombre d'informations concernant le noeud de blockchain utilisé

Pour lancer l'application :

```node app.js```

Dans le navigateur ```http://localhost:3000```

![Premier affichage](images/2_index_blockchaininfo.png)


### 1.4 Lecture d'une donnée

Nous allons maintenant enrichir tout ça en récupérant le nom de la personne à saluer et en l'affichant à l'écran.

**_payablehello.js :_**

```
/**
* Read the name from smart contract
*/
exports.readName = async function() {
	return payableHello.methods.getName().call({from: config.account});
}
```
On utilise l'objet ```payableHello``` défini précédement pour accéder aux méthodes du smart contact (```payableHello.methods```) et plus précisément à ```getName()```.
On termine l'instruction avec ```call()```, qui prend en paramètre les éléments pour effectuer une transaction. Ici, nous appelons une méthode qui est définie comme ```view``` dans le contrat, donc qui n'engendre pas de coût. Le seul paramètre que nous allons passer est l'adresse du compte qui va émettre cette transaction.

**_app.js :_**

On modifie la fonction renderIndex :

```
async function renderIndex(res) {

	try {
		displayData.nodeInfo = await payableHello.getNodeInfo();
		displayData.name = await payableHello.readName();
	}
	catch(error) {
		console.error(error);
	}

	res.render('index', displayData);
}
```
On y ajoute l'appel à notre fonction ```readName()```, pour initialiser la donnée à afficher.

Et enfin, dans notre template **_index.pug_**:

```
doctype html
html(lang='fr')
	head
		meta(charset='utf-8')
		title Ethereum Hello world
		script(type='text/javascript', src='https://code.jquery.com/jquery-3.3.1.slim.min.js')
		script(type='text/javascript', src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js')
		script(type='text/javascript', src='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js')
		link(rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css')
	body
	.container-fluid
		.row
			.col-md-6
				div.card
					h3.card-header Blockchain info
					div.card-body
						#info
							br
							div
								b Web3 version :&nbsp;
								span#web3-version #{nodeInfo.web3Version}
							div
								b Node :&nbsp;
								span#node #{nodeInfo.node}
							div
								b Last block :&nbsp;
								span#block-number #{nodeInfo.blockNumber}
							div
								b Coinbase :&nbsp;
								span#coinbase #{nodeInfo.coinbase}
							div
								b Balance :&nbsp;
								span#balance #{nodeInfo.balance}
							div
								b Contract balance :&nbsp;
								span#contract-balance #{nodeInfo.contractBalance}
			.col-md-6
				div.card
					h5.card-header Hello who ?
					div.card-body
						h2 Hello #{name}
```

Dans le navigateur :

![Bonjour qui ?](images/3_index_name.png)

Le nom s'affiche. Du moins, la valeur par défaut définie dans le constructeur.

## 6. Modification de la valeur<a name="6"></a>

## 7. Les événements<a name="7"></a>

## 8. Rendre la modification payante<a name="8"></a>

## 9. Administrer le contract<a name="9"></a>

## 10. Envoyer une transaction signée<a name="10"></a>

## 11. Ajouter un oracle<a name="11"></a>

## 12. Tests automatiques<a name="12"></a>

## Ressources<a name="links"></a>
Lien vers le repository avec le code source complet : http://
https://solidity.readthedocs.io/en/latest/
