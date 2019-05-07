# Comment développer une application Ethereum ?

Dans ce tutoriel, nous allons voir comment développer une application couplée à la blockchain Ethereum.

Mise à jour : 06/05/2019

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


## Vous avez dit asynchrone ?

Un des concepts important du développement d'application connectée à une blockchain est le concetp d'asynchronicité.
En effet, l'envoi de donneés à une blockchain se fait au moyen de transactions. Ces transactions, en plus d'entrainer des coûts d'utilisation, sont asynchrones.

Lorsqu'une transaction est envoyée, elle doit être validée par un des noeuds de la blockchain, ce qui peut prendre un temps variable.
Dans certains cas, il faut également attendre une confirmation afin d'être (presque) certain qu'elle ne sera pas remise en question par une chaine plus longue qui ne la prendrait pas en compte.

L'obtention du résultat, ou le simple fait de considérer une modification comme effective, doit se faire dans ces conditions.

Dans notre projet en Node.js, cet asynchronicité sera mise en place au moyen de promesses. Les mots clés _Promise_, _async_, _await_ seront donc largement de la partie :)

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
1. [Initialisation du projet](#1)
2. [Premier smart contract](#2)
3. [Test du smart contract](#3)
4. [Déploiement du smart contract](#4)
5. [Initialisation de l'application web](#5)
6. [Modification de la valeur](#6)
7. [Rendre la modification payante](#7)
8. [Les événements](#8)
9. [Administrer le contract](#9)
10. [Envoyer une transaction signée](#10)
11. [Ajouter un oracle](#11)
12. [Tests automatiques](#12)
13. [Ressources](#links)

***

## 1. Initialisation du projet<a name="1"></a>

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

Dans la partie "Blockchain info", nous pouvons voir que la valeur de la balance du compte utilisé, qui était à 100 ETH lors du lancement de Ganache, a été diminuée en fonction du coût des transactions qui ont permis de déployer les contrats.

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


**_index.pug_**:

On rajoute à la fin de notre template quelques lignes pour afficher le nom.


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

Nous allons maintenant pouvoir chercher à modifier le nom.

**_payablehello.js :_**

Commençons par créer le service

```
/*
* Call change name function and wait for event
* newName : the new name to set
*/
exports.updateName = async function(newName) {

	// object containing return values
	var result = new RequestResult();

	// estimate gas cost
	var gasAmount = await payableHello.methods.setName(newName).estimateGas({from: config.account, gas: 5000000});
	
	result.gas = gasAmount;

	var promiseSetName = new Promise( function (resolve, reject){

		// send a transaction to setName
		payableHello.methods.setName(newName).send({from: config.account, gas: gasAmount})
		.on('transactionHash', (hash) => {
				// when tx hash is known
			   console.log("tx hash : "+hash);
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
		   		// when receipt is created
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
		   		// when tx is confirmed
			   console.log("confirmation");
			   console.log(receipt);
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				console.error("promiseSetName on error");
				console.error(error);
				reject(error);
		   });
	}); // end of promiseSetName, result to return

	return promiseSetName;
}
```

On créer une méthode _updateName_ qui prend en paramètre le nouveau nom. Ensuite, le traitement va s'effectuer en plusieurs étapes : 

1. Nous allons appeler une méthode du smart contract qui modifie la blockchain, cette transaction va donc entrainer un coût d'utilisation. Ce coût s'exprime en _gaz_, le carburant d'Ethereum.
Dans un premier temps, il faut estimer la quantité de gaz nécessaire au moyen de ```estimateGas()```.

2. Puis nous pouvons appeler la méthode ```setName()``` en lui indiquant d'utiliser cette quantité de gaz. Il est possible de passer directement une grande quantité de gaz, mais au risque de la voir entièrement consommée si la transaction d'avère trop grosse, et donc qu'elle nous coûte très cher. A l'inverse, si la quantité de gaz fournie est trop faible, le gaz sera consommé, mais la transaction ne sera pas validée.
Le traitement d'une transaction étant asynchrone, nous récupérons une Promise, que nous allons retourner.

3. Ensuite, il faut attendre que la transaction soit prise en compte. Pour celà, nous allons utiliser plusieurs événements, qui se produisent à différents moment de la vie de la transaction :
- ```transactionHash``` : quand la transaction obtient un hash et est envoyée au réseau.
- ```receipt``` : quand le reçu de transaction est créé, on y trouve la majeur partie des informations concernant cette transaction.
- ```confirmtion``` : quand la transaction est confirmée (c'est à dire quand un certain nombre de blocs ont été minés à la suite de celui qui la contient, ce nombre peut être déterminé dans les options de connexion à la blockchain).
- ```error``` : en cas d'erreur

**_index.pug :_** 

Puis modifions notre template : 

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
		.row
			.col-md-6
				div.card
					h3.card-header Change name
					div.card-body
						#form
							form(method='post', action='/name')
								.form-group
									label(for='newName') Name :
									input#newName(type='text', name='newName').form-control
								div
									input(type='submit', value='Send').btn.btn-primary
			.col-md-6
				div.card
					h3.card-header Status
					div.card-body
						div#status Transaction : #{txStatus}
						div#blockNumber Block : #{blockNumber}
						div#errorMessage #{errorMessage}
```

On y ajoute un formulaire pour saisir le nouveau nom, ainsi qu'un bloc qui va afficher le résultat de la modification.


**_app.js :_**

Le formulaire effectue un POST sur ```/name```. Nous allons donc aussi modifier le contrôleur pour créer une route qui appelle le service créé précédemment.

```
/**
* Update name
*/
app.post('/name', function(req, res) {

	// execute the selected promise
	try {
		payableHello.updateName(req.body.newName)
		.then(
			(result) => {
				displayData.txStatus = result.txHash;
				displayData.blockNumber = result.blockNumber;
				displayData.errorMessage = result.errorMessage;
				res.redirect("/");
			},
			(error) => {
            			displayData.errorMessage = error;
				res.redirect("/");
			}
		);
	}
	catch(error){
		displayData.errorMessage = error;
		res.redirect("/");
	}
});
```

Nous pouvons afficher le résultat dans le navigateur :

![On peut changer de nom](images/4_index_changename.png)

Entrez le nom de votre choix, et cliquez sur "Send".

![On peut changer de nom](images/5_index_namechanged.png)

Dans le bloc "Status", nous récupérons le numéro de la transaction qui a modifié le nom et le numéro du bloc dans lequel elle a été validée.

Il est possible de récupérer en grand nombre d'informations sur la transaction. Pour celà, vous pouvez inspecter l'objet ```receipt``` obtenu lors de l'envoi de la transaction.

On peut également aller tester le smart contract avec Remix. On constatera que la valeur du nom est bien celle que nous avons envoyée.
On peut aussi consulter la liste des transactions dans Ganache pour retrouver celle que nous avons envoyée.

Dans la partie "Blockchain info", nous pouvons aussi voir que la valeur de la balance du compte utilisé diminue en fonction du coût de la transaction.


## 7. Rendre la modification payante<a name="7"></a>

Prochaine étape, nous allons maintenant rendre la modification du nom payante. Pour celà, nous allons mettre en place un certain nombre de conditions :
- La modification du nom coûte 2 ETH, mais il est possible de payer plus.
- Il ne doit pas être possible d'envoyer d'Ethers au smart contract sans modifier le nom.

**_PayableHello.sol :_**

tout d'abord, on ajoute une condition dans le smart contract, dans la méthode ```setName```, afin d'indiquer que son exécution requiert au minimum un envoie de 2 ETH dans la transaction :

```
pragma solidity ^0.5.0;

contract PayableHello {

    string private name;

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
		require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
    }

    function getName() public view returns (string memory) {
        return name;
    }
}
```

Via la fonction ```require()```, nous indiquons la condition à respecter et le message à retourner en cas de non respect.
Nous introduisons ici la variable globale ```msg```, qui contient les données relative à la transaction courante. On peut y touver l'adresse de l'émetteur (```sender```), le nombre d'Ethers envoyés (```value```) ...


**_payablehello.js:_**

Modifions le service afin de prendre en compte cette valeur :

```
/*
* Call change name function and wait for event
* newName : the new name to set
* price : the number of ethers we pay to change the name
*/
exports.updateName = async function(newName, price) {

	// object containing return values
	var result = new Object();

	// estimate gas cost
	var gasAmount = await payableHello.methods.setName(newName).estimateGas({from: config.account, gas: 5000000, value: web3.utils.toWei(price, "ether")});
	result.gas = gasAmount;

	var promiseSetName = new Promise( function (resolve, reject){

		// send a transaction to setName
		payableHello.methods.setName(newName).send({from: config.account, gas: gasAmount, value: web3.utils.toWei(price, "ether")})
		.on('transactionHash', (hash) => {
				// when tx hash is known
			   console.log("tx hash : "+hash);
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
		   		// when receipt is created
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
		   		// when tx is confirmed
			   console.log("confirmation");
			   console.log(receipt);
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				console.error("promiseSetName on error");
				console.error(error);
				reject(error);
		   });
	}); // end of promiseSetName, result to return

	return promiseSetName;
}

```
On ajoute un paramètre ```price``` à la méthode ```updateName```.
On utilise ce paramètre pour alimenter un nouveau paramètres ```value``` lors des appels à ```estimateGas``` et ```setName```.
Lors de ces appels, il faut passer une valeur en Wei, or nous l'avons en Ethers. Il faut donc la convertir grâce à ```web3.utils.toWei(price, "ether")``` qui prend en premier paramètre une valeur et en second paramètre l'unité de cette valeur.


**_index.pug :_**

Nous ajoutons maintenant au template un champ dans le formulaire de modification de nom, afin que l'utilisateur saisisse le prix qu'il souhaite payer.

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
		.row
			.col-md-6
				div.card
					h3.card-header Change name
					div.card-body
						#form
							form(method='post', action='/name')
								.form-group
									label(for='newName') Name :
									input#newName(type='text', name='newName').form-control
								.form-group
									label(for='price') Price (Eth) :
									input#price(type='text', name='price').form-control
								div
									input(type='submit', value='Send').btn.btn-primary
			.col-md-6
				div.card
					h3.card-header Status
					div.card-body
						div#status Transaction : #{txStatus}
						div#blockNumber Block : #{blockNumber}
						div#errorMessage #{errorMessage}


```

**_app.js :_**

Il ne reste plus qu'à modifier le contrôleur afin de prendre en compte ce nouvelle valeur transmise par le champ de formulaire.

```
/**
   * Update name
   */
   app.post('/name', function(req, res) {
   
   	// execute the selected promise
   	try {
   		payableHello.updateName(req.body.newName, req.body.price)
   		.then(
   			(result) => {
   				displayData.txStatus = result.txHash;
   				displayData.blockNumber = result.blockNumber;
   				displayData.errorMessage = result.errorMessage;
   				res.redirect("/");
   			},
   			(error) => {
               			displayData.errorMessage = error;
   				res.redirect("/");
   			}
   		);
   	}
   	catch(error){
   		displayData.errorMessage = error;
   		res.redirect("/");
   	}
   });
```

On récupère la valeur du champ ```price``` de la requête pour le transmettre en paramètre à ```updateName```.



## 8. Les événements<a name="8"></a>

Nous allons maintenant aborder la notion d'événements. En Solidity, il est possible de défini un événement, avec certains attributs. A certain endroit dans le code, nous pouvons émettre ces événements. Puis, une application peut écouter ces événement, elle sera ainsi notifiée à chaque fois que l'un d'entre eux se produit.

Les versions de Web3.js antérieures à 1.0 n'utilisaient pas les Promises. En conséquence, il fallait définir dans le smart contract un événement que l'on émettait lorsque la méthode était appelée. L'application écoutait cet événement, elle était ainsi prévenu quand la transaction était validée et que le code était exécuté, elle pouvait alors interroger la blockchain pour récupérer le reçu de transaction (receipt).

A partir de Web3.js 1.0, les promises rendent ce mécanisme moins utile, mais les événements conservent leur rôle d'historisation des actions. Nous allons voir comment les exploiter.


## 9. Administrer le contract<a name="9"></a>

## 10. Envoyer une transaction signée<a name="10"></a>

## 11. Ajouter un oracle<a name="11"></a>

## 12. Tests automatiques<a name="12"></a>

## Ressources<a name="links"></a>
Lien vers le repository avec le code source complet : http://
https://solidity.readthedocs.io/en/latest/
