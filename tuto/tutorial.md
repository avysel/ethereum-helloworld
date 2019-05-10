author: Alexandre Vanryssel
summary: Développer avec Ethereum
id: tuto-dapp-ethereum
categories: ethereum
environments: linux
status: draft
feedback link: https://github.com/avysel/ethereum-helloworld


# Développer avec Ethereum

Dans ce tutoriel, nous allons voir comment développer une application connectée à la blockchain Ethereum.

Mise à jour : 10/05/2019

***

**Sommaire :**
1. [Introduction](#1)
2. [Le projet](#2)
3. [Initialisation du projet](#3)
4. [Premier smart contract](#4)
5. [Test du smart contract](#5)
6. [Déploiement du smart contract](#6)
7. [Initialisation de l'application web](#7)
8. [Modification de la valeur](#8)
9. [Rendre la modification payante](#9)
10. [Administrer le contract](#10)
11. [Envoyer une transaction signée](#11)
12. [Les événements](#12)
13. [Ajouter un oracle](#13)
14. [Tests automatiques](#14)
15. [Debugguer un contrat](#15)
16. [Focus sur l'utilisation du gas](#16)
17. [Sécurité](#17)
18. [Exercices](#18)
19. [Ressources](#19)

***



## 1. Introduction<a name="1"></a>

### 1.1. Smart contracts
Ethereum permet la création de **smart contracts**. Ce sont des programmes qui sont envoyés à tous les noeuds du réseau et dont on active des fonctionnalités au moyen de transactions.
Ils vont donc s'exécuter sur tous les noeuds dès que ces derniers recevront la transaction correspondante.

Les smart contracts sont écrits en **Solidity**, un langage créé pour Ethereum. Ils sont exécutés dans l'**EVM (Ethereum Virtual Machine)**. C'est une **machine virtuelle à pile d'exécution** présente sur chaque noeud Ethereum. C'est à dire que le programme est décomposé en une suite d'instructions de base, placées sur une pile, et exécutées dans l'ordre de dépilage.

La documentation officielle du langage est disponible ici : 
[https://solidity.readthedocs.io/en/latest/](https://solidity.readthedocs.io/en/latest/)

Il est ensuite possible de connecter une application traditionnelle à un smart contract.

### 1.2. Mise en garde

Il faut garder à l'esprit que l'état de l'environnement d'exécution peut varier d'un noeud à l'autre. Par exemple, si un traitement nécessite l'envoi de plusieurs transactions, l'ordre de réception par chaque noeud du réseau sera aléatoire. La conception des smart contracts ne doit donc pas être dépendante de l'environnement.

Ensuite, comme tout élément stocké sur la blockchain, une fois validés, ils sont immuables. C'est à dire qu'il est impossible de mettre à jour ou supprimer un smart contract. D'où l'importance de mettre l'accent sur la qualité lors des développement.

Une mise à jour de smart contract équivaut au déploiement d'un nouveau smart contract. L'ancien restera toujours présent, avec ses données. Il pourra cependant être désactivé, mais ne sera jamais complètement supprimé.

### 1.3. DApp ?

Une DApp, ou **Decentralized Application**, application décentralisée, est une application déployée sur un réseau de façon uniforme et partagée, qui ne possède aucun élément central.

Une application reposant uniquement sur des smart contracts déployés sur une blockchain est donc une DApp. La coupler à une application NodeJS ou autre, déployée sur un serveur, hors de la blockchain, revient à créer un Single Point Of Failure. De ce fait, il ne s'agit plus réellement d'une DApp.


### 1.4. Vous avez dit asynchrone ?

Un des concepts important du développement d'application connectée à une blockchain est l'asynchronicité.
En effet, l'envoi de données à une blockchain se fait au moyen de transactions, diffusées au reste du réseau. Ces transactions, en plus d'entrainer des coûts d'utilisation, sont asynchrones.

Lorsqu'une transaction est envoyée, elle doit être validée par un des noeuds de la blockchain et intégré à un bloc, communiqué à l'ensemble du réseau. Ce qui peut prendre un temps variable.
Dans certains cas, il faut également attendre une confirmation afin d'être (presque) certain qu'elle ne sera pas remise en question par une chaine plus longue qui ne la prendrait pas en compte.

L'obtention du résultat, ou le simple fait de considérer une modification comme effective, doit se faire dans ces conditions.

Dans notre projet en Node.js, cette asynchronicité sera mise en place au moyen de promesses. Les mots clés _Promise_, _async_, _await_ seront donc largement de la partie :).
Si vous n'êtes pas familiers de ces concepts, [un petit détour par ici](https://javascript.info/async) vous sera utile.





## 2. Le projet<a name="2"></a>

### 2.1. Description du projet

Dans ce projet, nous allons créer un HelloWorld.

Dans un premier temps, il se composera d'un simple smart contract, contenant une propriété, le nom de la personne à saluer, ainsi que deux méthodes permettant de mettre à jour ce nom et de le récupérer.
Ensuite, nous créerons une applications Node.js qui affichera ce nom et proposera un formulaire pour le mettre à jour. Ces deux éléments seront liés aux méthodes du smart contract.

Dans un second temps, nous transformerons notre HelloWorld en service payant. La mise à jour du nom impliquera le paiement d'un certain prix.
Le propriétaire du smart contract pourra alors récupérer quand il le souhaite l'intégralité des sommes que les utilisateurs auront payées.

Techniquement, nous aborderons la création, le test et le déploiement d'un smart contract. Puis la connection d'un application Node.js à un smart contract et l'envoi de transactions à celui-ci.

### 2.2. Environnement technique

L'environnement d'exécution de ce tutorial se fera sous Linux, mais il est possible de trouver l'équivalent de chaque commande sous Windows ou Mac.

Ce tutorial sera basé sur Node.js. Il s'agit simplement de la technologie la plus répandue pour travailler avec les smart contracts, celle pour laquelle on trouve le plus d'outils et de frameworks disponibles.
Mais il est possible de trouver également des frameworks Java, Python ... qui fonctionnent de la même façon.

Nous allons dans un premier temps installer un certain nombre d'outils :

#### Node.js
Car le projet sera développé en Node.js :)

```
sudo apt-get install nodejs
```

#### Ganache
Une blockchain de test, qui s'exécute en local et fournit une interface visuelle pour voir ce qu'il s'y passe.

Téléchargez le fichier disponible ici [https://truffleframework.com/ganache](https://truffleframework.com/ganache)

#### Truffle
Un outil permettant de compiler, tester et déployer des smart contracts sur une blockchain.[https://truffleframework.com/truffle](https://truffleframework.com/truffle)

```  
npm install truffle
```


## 3. Initialisation du projet<a name="3"></a>

Dans un terminal, positionnez vous dans votre répertoire de travail, et lancez la commande suivante :

 ```
 truffle init
 ```
 
Après une courte phase de téléchargement et d'initialisation, nous voyons apparaitre 3 répertoires et 1 fichier :
 
**contracts** : code des smart contracts

**migrations** : scripts nécessaire à Truffle de effectuer les déploiements de contrats sur la blockchain.

**tests** : scripts de tests unitaires des smart contracts

**truffle-config.js** : fichier de configuration de Truffle

## 4. Premier smart contract<a name="4"></a>

Dans **contracts**, créer un fichier **PayableHello.sol**. Y saisir le code suivant :

```javascript
pragma solidity ^0.5.0;

contract PayableHello {

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

**pragma solidity ^0.5.0;** : décrit la version du compilateur que nous utilisons. Solidity est encore un langage qui évolue beaucoup et pour lequel il risque d'y avoir beaucoup d'incompatibilités entre les versions tant qu'il ne sera pas complètement stabilisé. Pouvoir choisir une version de compilateur permet donc de ne pas avoir à mettre à jour son code trop souvent. (Il est tout de même conseillé de le faire régulièrement pour bénéficier des améliorations de sécurité.)

Ensuite nous déclarons le contrat en indiquant son nom et en lui créant un champ privé de type chaine de caractères.

Ce contrat possède un constructeur, qui initialise son champ avec la valeur "nobody", ainsi qu'un getter et un setter pour modifier et accéder à ce champ.

Notez l'utilisation de certains mots clés :

**memory** : indique que la valeur de cette variable (**newName**) est stockée en mémoire uniquement et non dans la blockchain. Elle n'occasionnera donc aucun coût de stockage, contrairement au champ **name**.

**view** : indique que cette fonction ne modifie pas l'état de la blockchain car elle ne fait que retourner une valeur. Elle n'occasionnera elle non plus aucun coût et peut donc être appelée gratuitement, contrairement à **setName**, dont l'appel devra se faire via une transaction payante.

**returns (string memory)** : indique le type de retour de la fonction. Là encore, il faut préciser que la donnée retournée ne transitera que par la mémoire et non par le stockage sur la blockchain.

Maintenant, tapez la commande suivante :

```
truffle compile
```

Si la compilation se termine avec succès, un répertoire **build/contracts** vient d'être créé. Il contient les résultats de la compilation. C'est dans ce répertoire que nous trouverons les **ABI** (Application Binary Interface). Il s'agit des contrats de service, définis en json, que notre application aura besoin de connaitre pour pouvoir interagir avec le smart contract. Nous verrons cela par la suite.




<a name="5"></a>
## 5. Test du smart contract

Avant de déployer notre smart contract, nous allons le tester en utilisant Remix. C'est un IDE en ligne qui remplit à peu près le même rôle que Truffle. C'est l'occasion de tester un nouvel outil :).

https://remix.ethereum.org




<a name="6"></a>
## 6. Déploiement du smart contract

Tout d'abord, lancez Ganache (ou tout autre client Ethereum).

Nous allons modifier le fichier **truffle-config.js** pour indiquer à Truffle les paramètres de connexion :

```javascript
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

Dans le répertoire **migrations** dupliquez le fichier **1_initial_migration.js** en le nommant **2_hello_migration.js**. Modifiez le contenu de ce nouveau fichier de cette façon :

```javascript
const PayableHello = artifacts.require("PayableHello");

module.exports = function(deployer) {
  deployer.deploy(PayableHello);
};
```

Le paramètre du **require** doit être le nom du contrat tel que défini dans le fichier **PayableHello.sol**.


Maintenant, tapez la commande suivante :

```
truffle deploy
```

Vous devez obtenir le résultat suivant :

![Résultat du déploiement](images/1-deploy-result.png)

Vous obtenez différentes informations sur la transaction qui a déployé le contrat (numéro de transaction, coût ...).
Notez bien pour plus tard l'information la plus importante, l'adresse à laquelle le smart contract a été déployé ("contract address").

**Le contrat devra être redéployé à chaque modification.**

Il n'est pas nécessaire d'effectuer un **truffle compile** à chaque fois, le **truffle deploy** le fera automatiquement si besoin.

**A chaque déploiement, il ne faut pas oublier de modifier l'adresse du contrat dans le fichier de configuration.**

<a name="7"></a>
## 7. Application web

### 7.1. Création des fichiers

Nous allons initialiser une application web, basée sur Node.js, utilisant les framework Express pour MVC et Pug pour les templates HTML.
Dans un premier temps, nous allons créer une simple page d'index qui affiche des informations sur le noeud de blockchain auquel nous sommes connectés.

Nous allons créer plusieurs répertoires et fichiers :
- **src/** : pour contenir les sources de notre application web
- **src/views** : pour les templates des écrans
- **src/views/index.pug** : le template de l'index
- **src/app.js** : le contrôleur de l'application
- **src/payablehello.js** : les services de connexion à la blockchain
- **src/config.js** : la configuration de notre application

### 7.2. Installation des modules

Placez-vous dans le répertoire **src** et initialisez le projet Node.js avec la commande

```
npm init
```

Saisissez les quelques informations demandées pour initialiser le projet.

Nous allons maintenant installer les packages nécessaires.

#### Web3.js
Un framework javascript permettant d'interagir avec une blockchain.[https://web3js.readthedocs.io/en/1.0/index.html](https://web3js.readthedocs.io/en/1.0/index.html)
```                
npm install web3          
```                

Web3.js existe en version 0.20.X, qui est la version stable actuelle, et en version 1.0.X qui est encore en beta.
La version 0.20 permet une utilisation directement intégrée à des pages web, dans un navigateur. Elle est plus simple d'utilisation, mais sera prochainement dépréciée.
La version 1.0.X, bien que beta, a un bon niveau de stabilité et est bien plus complète. Cependant, elle impose un fonctionnement côté serveur, tel que Node.js.

Nous allons utiliser la version 1.0 pour ce tutorial.

#### EthereumJs-Tx
Un module permettant de manipuler des transactions
```
npm install ethereumjs-tx
```

#### Pug
Un moteur de templates Node.js pour nous aider à générer la page HTML de rendu
```
npm install pug
```

#### Express
Un module MVC Node.js
```
npm install express
```

### 7.3. Initialisation de l'application

1ère étape, se connecter à la blockchain au moyen de web3.

**config.js :**

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
- **nodeURL** et **nodePort** : éléments de connexion à Ganache
- **account** : adresse Ethereum du premier compte disponible sur Ganache.
- **abiFile** : chemin du fichier PayableHello.json dans le répertoire **build** généré par Truffle.
- **payableHelloContractAddress** : adresse à laquelle le contrat a été déployé avec Truffle. ("contract address" dans le résultat de **truffle deploy**)


### 7.2 Connection à la blockchain

**payablehello.js :**

```javascript
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

### 7.4 Connection au contrat

Nous allons maintenant nous connecter au contrat :

**payablehello.js :**

```javascript
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

Cette fonction récupère l'objet javascript ABI dans le fichier json et le passe en paramètre, avec l'adresse du smart contract déployé, à la méthode **web3.eth.Contract**, qui va retourner un object javascript permettant d'interagir avec le smart contract.

L'objet **payableHello** sera donc notre objet d'accès au contrat.

Nous pouvons initialiser notre template (on intègre Bootstrap pour faciliter la mise en forme) :

**index.pug :**
```html
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

Et pour lier tout ça, notre contrôleur, **app.js :**

```javascript
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

```
node app.js
```

Dans le navigateur **http://localhost:3000**

![Premier affichage](images/2_index_blockchaininfo.png)

Dans la partie "Blockchain info", nous pouvons voir que la valeur de la balance du compte utilisé, qui était à 100 ETH lors du lancement de Ganache, a été diminuée en fonction du coût des transactions qui ont permis de déployer les contrats.

### 7.5 Lecture d'une donnée

Nous allons maintenant enrichir tout ça en récupérant le nom de la personne à saluer et en l'affichant à l'écran.

**payablehello.js :**

```javascript
/**
* Read the name from smart contract
*/
exports.readName = async function() {
	return payableHello.methods.getName().call({from: config.account});
}
```
On utilise l'objet **payableHello** défini précédement pour accéder aux méthodes du smart contact (**payableHello.methods**) et plus précisément à **getName()**.
On termine l'instruction avec **call()**, qui prend en paramètre les éléments pour effectuer une transaction. Ici, nous appelons une méthode qui est définie comme **view** dans le contrat, donc qui n'engendre pas de coût. Le seul paramètre que nous allons passer est l'adresse du compte qui va émettre cette transaction.

**app.js :**

On modifie la fonction renderIndex :

```javascript
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
On y ajoute l'appel à notre fonction **readName()**, pour initialiser la donnée à afficher.


**index.pug**:

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

<a name="8"></a>
## 8. Modification de la valeur

Nous allons maintenant pouvoir chercher à modifier le nom.

**payablehello.js :**

Commençons par créer le service

```javascript
/*
* Call change name function and wait for event
* newName : the new name to set
*/
exports.updateName = async function(newName) {

	// object containing return values
	var result = new Object();

	// estimate gas cost
	var gasAmount = await payableHello.methods.setName(newName).estimateGas({from: config.account, gas: 5000000});
	
	result.gas = gasAmount;

	var promiseSetName = new Promise( function (resolve, reject){

		// send a transaction to setName
		payableHello.methods.setName(newName).send({from: config.account, gas: gasAmount})
		.on('transactionHash', (hash) => {
				// when tx hash is known
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
		   		// when receipt is created
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
		   		// when tx is confirmed
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				reject(error);
		   });
	}); // end of promiseSetName, result to return

	return promiseSetName;
}
```

On créer une méthode _updateName_ qui prend en paramètre le nouveau nom. Ensuite, le traitement va s'effectuer en plusieurs étapes : 

1. Nous allons appeler une méthode du smart contract qui modifie la blockchain, cette transaction va donc entrainer un coût d'utilisation. Ce coût s'exprime en _gaz_, le carburant d'Ethereum.
Dans un premier temps, il faut estimer la quantité de gaz nécessaire au moyen de **estimateGas()**.

2. Puis nous pouvons appeler la méthode **setName()** en lui indiquant d'utiliser cette quantité de gaz. Il est possible de passer directement une grande quantité de gaz, mais au risque de la voir entièrement consommée si la transaction d'avère trop grosse, et donc qu'elle nous coûte très cher. A l'inverse, si la quantité de gaz fournie est trop faible, le gaz sera consommé, mais la transaction ne sera pas validée.
Le traitement d'une transaction étant asynchrone, nous récupérons une Promise, que nous allons retourner.

3. Ensuite, il faut attendre que la transaction soit prise en compte. Pour celà, nous allons utiliser plusieurs événements, qui se produisent à différents moment de la vie de la transaction :
- **transactionHash** : quand la transaction obtient un hash et est envoyée au réseau.
- **receipt** : quand le reçu de transaction est créé, on y trouve la majeur partie des informations concernant cette transaction.
- **confirmtion** : quand la transaction est confirmée (c'est à dire quand un certain nombre de blocs ont été minés à la suite de celui qui la contient, ce nombre peut être déterminé dans les options de connexion à la blockchain).
- **error** : en cas d'erreur

**index.pug :** 

Puis modifions notre template : 

```html
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


**app.js :**

Le formulaire effectue un POST sur **/name**. Nous allons donc aussi modifier le contrôleur pour créer une route qui appelle le service créé précédemment.

```javascript
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

Il est possible de récupérer en grand nombre d'informations sur la transaction. Pour celà, vous pouvez inspecter l'objet **receipt** obtenu lors de l'envoi de la transaction.

On peut également aller tester le smart contract avec Remix. On constatera que la valeur du nom est bien celle que nous avons envoyée.
On peut aussi consulter la liste des transactions dans Ganache pour retrouver celle que nous avons envoyée.

Dans la partie "Blockchain info", nous pouvons aussi voir que la valeur de la balance du compte utilisé diminue en fonction du coût de la transaction.

<a name="9"></a>
## 9. Rendre la modification payante

Prochaine étape, nous allons maintenant rendre la modification du nom payante. Pour celà, nous allons mettre en place un certain nombre de conditions :
- La modification du nom coûte 2 ETH, mais il est possible de payer plus.
- Il ne doit pas être possible d'envoyer d'Ethers au smart contract sans modifier le nom.

**PayableHello.sol :**

Tout d'abord, on modifie le contrat : 

```javascript
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
    
    function() external payable {
        revert();
    }
        
}
```

On ajoute une condition dans la méthode **setName**, afin d'indiquer que son exécution requiert au minimum un envoi de 2 ETH dans la transaction.
Via la fonction **require()**, nous indiquons la condition à respecter et le message à retourner en cas de non respect.
Nous introduisons ici la variable globale **msg**, qui contient les données relative à la transaction courante. On peut y touver l'adresse de l'émetteur (**sender**), le nombre d'Ethers envoyés (**value**) ...

Notez également l'ajout du mot clé **payable** dans la définition de la méthode. Il indique qu'elle pourra être appelée par des transactions qui envoient des Ethers. 
Envoyer des Ethers à une méthode qui n'est pas **payable** échouera.

Nous avons aussi ajouté ce que l'on appelle la fonction de fallback :

```
    function() external payable {
        revert();
    }
```

Cette fonction, sans nom, est automatiquement appelée lorsque le contrat reçoit une transaction avec des Ethers, sans appel de méthode spécifiquement.
Ici, nous exécutons simplement **revert()** pour indiquer que la transaction doit être annulée si nous sommes dans ce cas.

Cette fonction fallback est définie elle aussi comme **payable**, mais également comme **external**, c'est à dire qu'elle ne peut être appelée que depuis l'extérieur, et non par des méthodes du contrat.


**payablehello.js:**

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
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
		   		// when receipt is created
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
		   		// when tx is confirmed
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				reject(error);
		   });
	}); // end of promiseSetName, result to return

	return promiseSetName;
}

```
On ajoute un paramètre **price** à la méthode **updateName**.
On utilise ce paramètre pour alimenter un nouveau paramètres **value** lors des appels à **estimateGas** et **setName**.
Lors de ces appels, il faut passer une valeur en Wei, or nous l'avons en Ethers. Il faut donc la convertir grâce à **web3.utils.toWei(price, "ether")** qui prend en premier paramètre une valeur et en second paramètre l'unité de cette valeur.


**index.pug :**

Nous ajoutons maintenant au template un champ dans le formulaire de modification de nom, afin que l'utilisateur saisisse le prix qu'il souhaite payer.

```html
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

**app.js :**

Il ne reste plus qu'à modifier le contrôleur afin de prendre en compte ce nouvelle valeur transmise par le champ de formulaire.

```javascript
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

On récupère la valeur du champ **price** de la requête pour le transmettre en paramètre à **updateName**.

Nous pouvons maintenant tester :

![On peut changer de nom en payant](images/6_index_pay.png)

Tapez un nom, entrez une valeur supérieure ou égale à 2 dans le champ "price", et validez.
On peut constater que la balance du compte a été réduite du nombre d'Ether donné, plus un peu de gaz, et que la balance du contrat a, quant à elle, augmenté de cette même somme.
Celà signifie que pour le moment, c'est bien le smart contract qui possède les Ethers que nous lui avons envoyés.


Nous pouvons aussi essayer de changer de nom en en payant qu'un seul Ether : 

![On doit payer la somme minimum](images/7_index_revert.png)

Nous obtenons une erreur, qui contient le message que nous avons passé en paramètre de ***require()*** dans le cas où la condition ne serait pas remplie.
Les balances du compte et du contrat n'ont pas bougés, donc les Ethers n'ont pas été transférés et le nom n'a pas changé, preuve que la transaction n'a pas été acceptée.
Cependant, la balance du compte a quand même perdu quelques Wei. En effet, même si une transaction est rejetée, le gas consommé pour la prendre en compte est bel et consommé pour de bon.

<a name="10"></a>
## 10. Administrer le contrat

Bien, maintenant que nous savons que le contrat possède des Ethers, il serait bien de pouvoir les récupérer, et si possible, uniquement par son propriétaire.

Nous allons donc modifier le contrat pour :
- pouvoir récupérer les Ethers et les envoyer à une adresse
- faire en sorte que les Ethers ne puissent être envoyés qu'au propriétaire du contrat.

**PayableHello.sol :**

```javascript
pragma solidity ^0.5.0;

contract owned {
	address payable owner;

	// Contract constructor: set owner
	constructor() public {
		owner = msg.sender;
	}

	// Access control modifier
	modifier onlyOwner {
	    require(msg.sender == owner, "Only the contract owner can call this function");
	    _;
	}

	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}

}

contract PayableHello is owned {

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

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
		msg.sender.transfer(balance);
    }

    function() external payable {
        revert();
    }

}
```

Nous allons introduire deux nouvelles notions : l'héritage et les modificateurs.

Nous créons un nouveau contrat **owned** composé de :
- un champ privé **owner** qui contiendra l'adresse du propriétaire de ce contrat (notez que ce champ est **payable**)
- un constructeur, qui initialise **owner** avec l'adresse qui a émit la transaction de création du contrat
- une méthode de type **modifier** appelée **onlyOwner**. Il s'agit de définir un comportement, afin de créer un sorte de "mot-clé" que l'on réutilisera sur d'autres méthodes, pour lesquelles ce comportement s'appliquera.
Ici, ce modificateur comporte une condition qui impose que l'utilisateur qui l'appelle soit le propriétaire du contrat, donc que son adresse soit celle qui a créé le contrat. 
Ensuite, on trouve **_;** qui signifie tout simplement "Exécuter ici le code défini dans la méthode qui utilise ce modificateur".
En gros, toute fonction qui se verra appliquer le modificateur **onlyOwner** exécutera la condition de propriété, puis exécutera ensuite son code propre.
- une méthode **destroy**, à laquelle le modificateur **onlyOnwer** est appliquée, qui exécute **selfdestruct**. Cette méthode désactive le contrat et transfère sa balance à l'adresse qui l'appelle. Vous comprenez pourquoi il faut restreindre son accès au propriétaire, sinon n'importe qui pourrait tout casser et prendre l'argent.
A noter qu'un contrat qui a subit un **selfdesctuct** est désactivé, mais pas supprimé. Il ne peut plus exécuter ses méthodes, par contre, il sera toujours possible de lui envoyer des Ethers, qui seront alors perdus car il sera impossible de les récupérer.

Ensuite, nous modifions la définition du contrat PayableHello en **PayableHello is owned**. Cela signifie que **PayableHello** hérite de toutes les propriétés de **owned**.
L'adresse de son propriétaire est donc enregistrée, il pourra être désactivé par lui uniquement. Le modificateur **onlyOwner** pourra aussi être appliqué à n'importe laquelle de ses méthodes.

D'ailleurs, nous ajoutons aussi une méthode **withdraw** qui utilise ce modificateur. Elle récupère l'adresse de l'émetteur de la transaction via **msg.sender** et lui envoie la balance via **transfert**.

Une fois le contrat modifié, nous allons créer un service pour permettre au propriétaire de récupérer ses Ethers :

**payablehello.js :**
```javascript
/**
* Retreive contract balance. Only works for contract owner
* withdrawAccount : the address to send ethers to
*/
exports.withdraw = async function(withdrawAccount) {

	var result = new Object();

	// estimate gas cost
	var gasAmount = await payableHello.methods.withdraw().estimateGas({from: withdrawAccount, gas: 5000000});
	result.gas = gasAmount;

	var promiseWithdraw = new Promise( function (resolve, reject){

		// send tx to withdraw function
		payableHello.methods.withdraw().send({from: withdrawAccount, gas: gasAmount*2})
		.on('transactionHash', (hash) => {
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				result.errorMessage = error;
				reject(result);
		   });
	});

	return promiseWithdraw;
}
```

Nous lui ajoutons une méthode **withdraw** qui prend en paramètre l'adresse vers laquelle transférer la balance du contrat.
Sur le même modèle que pour modifier le nom, cette méthode va d'abord estimer le gaz nécessaire pour appeler la méthode **withdraw** du contrat depuis l'adresse passée en paramètre. Puis va effectivement réaliser l'appel.
Comme il s'agit également d'un envoi de transaction, nous allons ici aussi exploiter les différents événements disponibles pour récupérer les informations inhérentes à cette transaction.


Maintenant modifions la page pour ajouter cette fonctionnalité :

**index.pug :**

```html
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
							div
								form(method='post', action='/withdraw')
									div
										input(type='submit', value='Withdraw').btn.btn-primary
										span#withdraw-status
										
...
```

Dans le bloc "Blockchain info", nous ajoutons un formulaire qui ne contient qu'un seul bouton nommé **"Withdraw"**, qui valide le formulaire vers l'URL **POST /withdraw**.
Nous allons donc maintenant modifier le contrôleur pour ajouter cette nouvelle route.

**apps.js :**

```javascript
/**
* Withdraw contract balance
*/
app.post('/withdraw', function(req, res) {

	try {
		payableHello.withdraw(config.account)
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
	catch(error) {
		displayData.errorMessage = error;
		res.redirect("/");
	}
});
```

Nous appelons le service **withdraw*** avec comme paramètre l'adresse par défaut de notre configuration, celle qui a bien servi à créer le contrat.

On peut maintenant tester :

![Avant le retrait](images/8_index_beforewithdraw.png)

Avant le retrait, le compte a une balance de 90 ETH environ, et le contrat, 7 ETH. Cliquez sur "withdraw".

![Après le restrait](images/9_index_afterwithdraw.png)

Maintenant, la balance du contrat est revenue à 0, alors que le compte a récupéré 7 ETH supplémentaires.

Ca a donc fonctionné, parce que le compte que nous avons utilisé est bien le propriétaire du contrat.

Nous savons maintenant comment créer un service payant, et récupérer l'argent qu'il a généré.

<a name="11"></a>
## 11. Envoyer une transaction signée

Pour le moment, il nous a été facile d'envoyer des transactions en utilisant un compte par défaut, que nous avons renseigné dans la configuration du projet. Nous avons émis en son nom un certain nombre de transactions, qui lui ont coûté des Ethers. Et pourtant, à aucun moment, il ne nous a été demandé de justifier que ce compte nous appartenait, en saisissant un mot de passe ou en fournissant une clé privée par exemple.
Ca a été possible parce que ce compte est enregistré dans le noeud de blockchain que nous utilisons, et que par défaut dans Ganache, les comptes sont déverouillés, c'est à dire, utilisables directement.

Avec un vrai noeud Ethereum, il aurait fallu enregistrer notre compte puis le déverrouiller en fournissant sa clé privée dans un keystore.

Maintenant, dans notre projet, nous allons élargir un peu les possibilités en termes d'utilisation de comptes en donnant la possibilité de créer des transactions signées, c'est-à-dire dont l'utilisateur fournit son adresse et sa clé privée. Notre projet sera ainsi accessible à tout compte, qu'il soit enregistré ou non dans notre noeud de Blockchain.

Attention : dans ce qui va suivre, nous allons manipuler des clés privées, qui sont le point sensible en matière de sécurité sur la blockchain. Nous allons le faire de façon simple, pour en apréhender le fonctionnement, mais dans un réel projet de production, il faudra mettre en place les politiques de sécurité adaptées pour les manipuler (HMS, keystore ...).

Voici ce que nous allons faire :
1. Ajouter des comptes et leurs clés privées dans la configuration (ce qui doit être bien plus sécurisé que ça dans la vraie vie)
2. Ajouter à l'écran un liste de choix du compte à utiliser
3. Pour chaque appel au smart contract, forger une transaction en fonction du compte sélectionné.

Pour créer d'autres comptes, vous pouvez afficher la liste des comptes de Ganache, et prendre tous les autres comptes autres que le premier. Les clés privées peut être obtenus en cliquant sur l'icône "clé", sur la droite de l'écran pour chaque compte.

**config.js :**
```javascript
const config = {

	// blockchain node IPC IP and port
	nodeURL: "http://127.0.0.1",
	nodePort: 7545,

	// default account address
	account:"0xdB4524A58c78f0945338fe7fF7c3E5988d413032",

	// ABI file of smart contract
	abiFile:"../build/contracts/PayableHello.json",

	// address of deployed contract on blockchain
	payableHelloContractAddress:"0x31314b12bBC4b9F21B08565EEB5840aF6A1F8dfD",

	// all available accounts with their private key (except for first account, that is the default account)
	accounts: [
		{
			address: "0xdB4524A58c78f0945338fe7fF7c3E5988d413032",
			pk: null
		},
		{
			address: "0x4a4817F49F7f31a2c639C5C723D4BAA194AD0f77",
        	pk: "12cc2f60b68a8fefb85e93fed0a2ae4680a465f714e4ea42f4a73cf27f317257"
		},
		{
			address: "0xD04EabD4Ba1d8C655B3f95A24e89CaBbfFe0af33",
        	pk: "4b535457d08e576c956d693ef8f17cf07bfd364ed0de401c942537da92254a1f"
		}
	]

};

module.exports = config;
```

**app.js :**

On rajoute dans le contrôleur, à l'initialisation des données d'affichage, la liste des comptes.
```javascript
displayData.accounts = config.accounts;
```

**index.pug :**

Et on modifie l'index pour afficher la liste des ces comptes au niveau du bouton de retrait de l'argent du contrat et de modification du nom.

```html
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
							hr
							div
								form(method='post', action='/withdraw')
									.form-group
										label(for='withdrawAccount') Account :
										select#withdrawAccount(name='withdrawAccount').form-control
											each account in accounts
												option(value=account.address) #{account.address}
									div
										input(type='submit', value='Withdraw').btn.btn-primary
										span#withdraw-status
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
								.form-group
									label(for='account') Account :
									select#account(name='account').form-control
										each account in accounts
											option(value=account.address) #{account.address}
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

Voici le résultat à l'affichage :

![Affichage des comptes](images/10_index_displayaccounts.png)

Maintenant, nous allons exploiter tout ça.

**app.js :**

Dans le contrôleur, nous allons prendre en compte ce nouveau champ de formulaire, dans **POST /name** et dans **POST /withdraw**.

```javascript
/**
* Update name
*/
app.post('/name', function(req, res) {

	var promiseUpdateName;

	if(req.body.account === config.account) {
		// use default account activated on blockchain
		promiseUpdateName = payableHello.updateName(req.body.newName, req.body.price);
	}
	else {
		// use another account from default one, need to sign a raw transaction
		promiseUpdateName = payableHello.sendRawTransaction(req.body.newName, req.body.price, req.body.account);
	}

	// execute the selected promise
	try {
		promiseUpdateName
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


/**
* Withdraw contract balance
*/
app.post('/withdraw', function(req, res) {

...
		payableHello.withdraw(req.body.withdrawAccount)
...
});


```

Dans le **POST /name**, nous ajoutons une condition pour continuer à utiliser les méthodes définies précédemment si c'est le compte par défaut qui a été sélectionné, ou un nouveau service **sendRawTransaction** pour envoyer une transaction signée si c'est un autre compte.

Maintenant, créons ce service **sendRawTransaction** :

**payablehello.js :**

```javascript
...
var EthereumTx = require("ethereumjs-tx");
...

/**
* Update name using smart contract, using account different from default one
* newName : the new name to set
* price : the number of ethers we pay to change the name
* address : the address used to send tx
*/
exports.sendRawTransaction = async function(newName, price, address) {

	var result = new Object();
	var plainPrivateKey = null;

	// get privake key from config according for sender address
	config.accounts.forEach(function(element) {
		if(element.address === address){
			plainPrivateKey = element.pk;
		}
	});

	// get tx count for address
	var txCount = await web3.eth.getTransactionCount(address);

	// create tx
	var txParams = {
		from: address,
		nonce: web3.utils.toHex(txCount),
		gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
		gasLimit: web3.utils.toHex(4000000),
		to: config.payableHelloContractAddress,
		value: web3.utils.toHex(web3.utils.toWei(price, "ether")),
		data: web3.utils.toHex(payableHello.methods.setName(newName).encodeABI())
	}

	// estimate tx gas cost
	var gasAmount = await web3.eth.estimateGas(txParams);
	result.gas = gasAmount;

	// update gas limit
	txParams.gasLimit = web3.utils.toHex(gasAmount);

	// create result promise that will be resolved when tx is confirmed
	var promiseSendRawTx = new Promise( function (resolve, reject){

		// create raw tx
		const tx = new EthereumTx(txParams);

		// encode pk in hex
		const privateKey = Buffer.from(plainPrivateKey, 'hex');

		// sign tx with private key
		tx.sign(privateKey)

		// serialize tx
		const serializedTx = tx.serialize();

		// send raw tx
		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
		.on('transactionHash', (hash) => {
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				reject(error);
		   });


	}); // end of promiseSendRawTx, to be returned

	return promiseSendRawTx;
}

```

Tout d'abord, il faut importer **EthereumTx**, qui nous aidera à construire des transactions signées.


Décortiquons ce que fait ce service :
1. Dans un premier temps, s'il reçoit en paramètre une adresse différente du compte par défaut, il va récupérer sa clé privée dans la configuration. (Cette étape devrait être beaucoup plus sécurisée dans la vraie vie.)
2. Ensuite, il récupère le nombre de transactions que ce compte a déjà effectué, au moyen de **web3.eth.getTransactionCount(address)**. Cette information sera à fournir en tant que nonce, pour éviter que la même transaction soit envoyée plusieurs fois.
3. Puis il crée un transaction en renseignant tous les champs individuellement. Chaque valeur doit être fournie en hexadécimal, on peut utiliser **web3.utils.toHex** pour faciliter la conversion. 
4. On estime ensuite la quantité de gaz nécessaire, que l'on vient mettre à jour dans la transaction précédemment créée.
5. Et enfin, au moyen du module **EthereumTx**, on crée la transaction que l'on vient signer avec la clé privée. La transaction sera ensuite sérialisée, puis envoyeé au moyen de **web3.eth.sendSignedTransaction*, sans oublier de la préfixer par **Ox**.

Maintenant, on peut tester toutes les opérations définies précédemment, en choisissant un compte de la liste.

Il doit être possible pour n'importe quel compte de modifier le nom. Vous devez voir dans les liste des comptes dans Ganache les balances des comptes correspondants se réduire.

Par contre, si vous tenter de retirer les Ethers (Withdraw) avec un compte différent du compte par défaut, vous obtenez l'erreur suivante :

![Seul l'administrateur peut retirer les Ether](images/11_index_forbiddenwithdraw.png)

<a name="12"></a>
## 12. Les événements

Nous allons maintenant aborder la notion d'événements. En Solidity, il est possible de définir un événement, avec certains attributs. A certain endroit dans le code, nous pouvons émettre ces événements. Puis, une application peut écouter ces événement, elle sera ainsi notifiée à chaque fois que l'un d'entre eux se produit.

Les versions de Web3.js antérieures à 1.0 n'utilisaient pas les Promises. En conséquence, il fallait définir dans le smart contract un événement que l'on émettait lorsque la méthode était appelée. L'application écoutait cet événement, elle était ainsi prévenu quand la transaction était validée et que le code était exécuté, elle pouvait alors interroger la blockchain pour récupérer le reçu de transaction (receipt).

A partir de Web3.js 1.0, les Promises rendent ce mécanisme moins utile, mais les événements conservent leur rôle d'historisation et de notification des actions. Nous allons voir comment les exploiter.

Nous allons afficher l'historique des modifications du nom, en indiquant quel utilisateur l'a demandée et combien il a payé.

Tout d'abord, modifions le contrat pour créer l'événement.

**PayableHello.sol :**

```javascript
contract PayableHello is owned {

    string private name;

	event NameChanged(string newName, address userAddress, uint value);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName, msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
		msg.sender.transfer(balance);
    }

    function() external payable {
        revert();
    }

}
```

Tout tient en 2 instructions :

**event NameChanged(string newName, address userAddress, uint value);** : la définition de l'événement, avec le mot clé **event**. Ensuite on le nomme et on indique une liste de paramètres qu'il va prendre. Ici, le nouveau nom, l'adresse de l'utilisateur et le prix payé.

**emit NameChanged(newName, msg.sender, msg.value);** : la création de l'événement, dans la méthode **setName**, avec le mot clé **emit**. Nous lui passons les valeurs attendues en paramètres.

Ces événements ne servent pas à grand chose s'ils ne sont pas exploités. Nous allons donc créer un service qui les récupère :


**payablehello.js :**

```javascript
/*
* Get all NameChanged events data
*/
exports.getNameChangedHistory = async function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {

		// get all emited events from first block to last block
		payableHello.getPastEvents("NameChanged", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
					var valueInEth = web3.utils.fromWei(item.returnValues.value.toString(), 'ether');
				  	eventsList.push({ block:item.blockNumber, name:item.returnValues.newName, userAddress:item.returnValues.userAddress, value:valueInEth});
				});
				resolve(eventsList);
			});
	});
}
```

Nous récupérons les événements au moyen de  **payableHello.getPastEvents("NameChanged", { fromBlock: 0, toBlock: 'latest' })**. Il suffit d'utiliser **getPastEvents** sur notre objet **payableHello**, et de lui passer en paramètre le nom du contrat concerné, ainsi quelques paramètres supplémentaires, par exemple ici nous indiquons que nous allons chercher du bloc 0 jusqu'au dernier (soit toute la chaine).

Puis on modifie le contrôleur pour récupérer des données :

```
async function renderIndex(res) {

	try {
		displayData.nodeInfo = await payableHello.getNodeInfo();
		displayData.name = await payableHello.readName();
		displayData.nameHistory = await payableHello.getNameChangedHistory();
	}
	catch(error) {
		console.error(error);
	}

	res.render('index', displayData);
}
```

Et enfin, on modifie le template pour les afficher (on ajoute un bloc à la fin) :

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
							hr
							div
								form(method='post', action='/withdraw')
									.form-group
										label(for='withdrawAccount') Account :
										select#withdrawAccount(name='withdrawAccount').form-control
											each account in accounts
												option(value=account.address) #{account.address}
									div
										input(type='submit', value='Withdraw').btn.btn-primary
										span#withdraw-status
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
								.form-group
									label(for='account') Account :
									select#account(name='account').form-control
										each account in accounts
											option(value=account.address) #{account.address}
								div
									input(type='submit', value='Send').btn.btn-primary
			.col-md-6
				div.card
					h3.card-header Status
					div.card-body
						div#status Transaction : #{txStatus}
						div#blockNumber Block : #{blockNumber}
						div#errorMessage #{errorMessage}

		.row
			.col-md-12
				div.card
					h3.card-header Names history
					div.card-body
						ul
						each item in nameHistory
							li= 'Block '+item.block +' -> '+item.name + ' ('+item.userAddress+', '+item.value+')'
```


Maintenant, il suffit de redéployer le contrat, de faire quelques changements de nom, avec différents comptes, et nous voyons l'historique des changements :

![Historique des changements de nom](images/12_index_history.png)

<a name="13"></a>
## 13. Ajouter un oracle

Pour l'instant, nous avons vu comment développer une application décentralisée reposant uniquement sur un smart contract, comment coupler un smart contract sur une application "traditionnelle". Maintenant, nous allons voir les oracles.
Un oracle est un terme qui désigne une façon pour une DApp (smart contract seulement) d'interagir avec l'extérieur.

Cependant, derrière ce nom, aucun concept nouveau ni magique ne se cache. Il ne s'agit ni plus ni moins que d'une application qui interroge régulièrement ou écoute une source de données, et envoie des transactions au smart contract dans certaines conditions.

Nous allons mettre en place l'exemple suivant :
- Une API génère un nouveau nom toutes les minutes
- Un oracle va mettre à jour le nom dans le contrat à chaque fois que le nom change dans l'API

Tout d'abord, créons l'API. Ici, il s'agit juste de fournir un exemple simple pour illustrer une source de données pouvant impacter la blockchain. Elle est complètement indépendant et décorellée de ce que nous avons fait précédemment

**api.js :**

```javascript
/**
* Simple API that provides a new string every minute
*/

var express = require('express');
var stringify = require('json-stringify-safe');
var config = require("../config.js");

var app = express();

app.get('/name', function(req, res) {
	console.log("GET /name");
	var responseBody = new Object();
	var today = new Date();

	// name is Toto-yyyymmddhhmm
	responseBody.name = "Toto-"+today.getFullYear()+(today.getMonth()+1)+today.getDate()+today.getHours()+today.getMinutes()+today.getSeconds();
	console.log("Response : "+responseBody.name);
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseBody));

});

// start server on port 3001
app.listen(3001);
```
Cette API, disponible sur le port 3001, va simplement exposer une route **GET /name** qui retourne une chaine de caractères composée de "Toto" concaténée à la date et heure du jour à la minute. Ce qui fait que le résultat changera chaque minute.

Maintenant, créons l'oracle proprement dit :

Faisons un petit 
```
npm install request
``` 
juste avant, afin de pouvoir exploiter le module **request** qui nous facilitera la vie avec les requêtes HTTP vers l'API.

**oracle.js :**

```javascript
/*
* Ethereum oracle example
* Reads an API every 10 seconds, get different value each time and use PayableHello to update name with this value
*/

var request = require('request');
var config = require("../config.js");
var payableHello = require('../payablehello'); // app services


async function readAPI() {

	request({url: 'http://127.0.0.1:3001/name', json: true}, async function(err, res, json) {
		 if (err) {
			console.error(err);
		}

		var name = json.name;
		var price = "2";

		await payableHello.updateName(name, price)
		.then(
			(result) => {
				console.log(result);
			},
			(error) => {
				console.error(error);
			}
		);
    });

}

// init blockchain connection
payableHello.connection();
payableHello.initContracts();

setInterval(readAPI, 1000 * 10);
```

Etudions cet oracle :
1. Il importe le module de services **payablehello.js** pour pouvoir utiliser les services qui accèdent au smart contract
2. Il se connecte à la blockchain et initialise le contrat, de la même façon que le contrôleur **app.js** de notre projet.
3. Il lance toutes les 10 secondes une méthode qui
	1. Interroge l'API est récupère le nom
	2. Vérifie si le nom a été modifié depuis le dernier appel
	3. Si c'est le cas, appelle le service **updateName** en lui fournissant le nouveau nom, et un prix fixe défini à l'avance.
	
Précision : le compte par défaut, définit dans notre **config.js** sera utilisé par cet oracle. Il est possible de faire évoluer l'oracle pour gérer les comptes plus finement, mais ce n'est pas le sujet ici.

Pour tester, procédez en plusieurs étapes :

1. Lancer l'application web
```
node app.js
```

2. Dans un autre terminal, lancez l'API de test
```
node api.js
```

3. Dans un nouveau terminal, lancez l'oracle
```
node oracle.js
```

Dans les logs de l'API, vous devriez voir qu'un appel a lieu toutes les 10 secondes, mais que le nom ne change que toutes les minutes.
Dans les logs de l'oracle, vous devriez voir qu'une transaction est émise toutes les minutes.
Sur l'application web, si vous rafraichissez régulièrement, vous voyez le nom changer toutes les minutes, ainsi que l'historique des changements de nom se remplir au fil du temps.

![L'oracle change le nom automatiquement](images/14_index_oracle.png)

Et voilà, c'est un oracle !

<a name="14"></a>
## 14. Tests automatiques

Au début de ce tutoriel, nous avons insisté sur l'immuabilité des smart contracts, donc de la nécessité de prendre grand soin de la qualité.

Truffle permet d'écrire des tests unitaires, ils seront placés dans le répertoire **test**.

Pour la documentation complète, voir ici :
https://truffleframework.com/docs/truffle/testing/testing-your-contracts

Ces tests peuvent être écrits en Javascript ou Solidity.

Ici, nous avons amené les tests assez tardivement, pour permettre de passer en revue au préalable un certain nombre de notions nécessaires. Par la suite, il sera plus approprié d'effectuer ces tests avant le déploiement du contrat.

### 14.1 Tester avec Javascript

Les tests javascript de Truffle utilisent les frameworks [Mocha](https://mochajs.org/) et [Chai](https://www.chaijs.com/).
Nous n'allons pas nous étendre sur la syntaxe de ces deux frameworks, leurs documentations respectives  

Nous allons créer un fichier **payablehello-test.js**.

Voici un exemple de test qui valide que lors de l'initialisation du contrat, le nom est bien "nobody".

**payablehello-test.js :**

```javascript
const Hello = artifacts.require("PayableHello");

contract("PayableHello", async accounts => {

	it("should display 'nobody' when no name set", async () => {
		let hello = await Hello.deployed();
		let name = await hello.getName.call();
		assert.equal(name, "nobody","name wasn't nobody");
	});
});

```

### 14.2 Tester en Solidity

Idem que précédement, mais cette fois en Solidity. Nous allons créer un fichier **TestPayableHello.sol**.
Attention, les contrats de test doivent impérativement commencer par **Test** et il ne faut pas oublier de les ajouter au fichier de migration.

**TestPayableHello.sol :**

```javascript
pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PayableHello.sol";

contract TestPayableHello {

  function testInitialPayableHello() public {
    PayableHello payableHello = PayableHello(DeployedAddresses.PayableHello());

    string memory expected = "nobody";

    Assert.equal(payableHello.getName(), expected, "name wasn't nobody");
  }

}
```

**3_payablehello_migrations.js :**

A revoir ?

```javascript
const PayableHello = artifacts.require("PayableHello");
const TestPayableHello = artifacts.require("TestPayableHello");

module.exports = function(deployer) {
  	deployer.deploy(PayableHello);
    deployer.deploy(TestPayableHello);
};

```

### 14.3 Exécuter les tests

Exécutez la commande :

```
truffle test
```

Vous devriez obtenir un résultat de ce type :

![Résultat des tests](images/13_truffle_test.png)

<a name="15"></a>
## 15. Debugger un contrat

<a name="16"></a>
## 16. Focus sur l'utilisation du gaz

<a name="17"></a>
## 17. Sécurité

Un point d'attention particulier doit être apporté à la sécurité, notamment sur certains points : 

### Clés privées

Les clés privés sont au coeur de la sécurité sur une blockchain. Elles permettent de signer les transactions, de revendiquer la possession d'actifs ... Il faut les protéger, les garder dans le secret le plus absolu.
(De même pour la phrase seed).

Dans notre projet, nous avons fait quelques tests avec des clés privées mises en clair dans un fichier de configurations. Dans un réel projet, les clés privées doivent être beaucoup mieux sécurisées. Personne d'autre que leur propiétaire légitime ne doit pouvoir y accéder.


### Ré-entrée

Une des erreurs de programmation d'un smart contract les plus dangereuses est de créer sans le savoir une "faille de ré-entrée".

Vous trouverez des explications et un exemple ici :

https://github.com/avysel/ethereum-reentrancy


### Ownership des contrats

Nous avons mis en place dans ce projet une gestion de la propriété d'un smart contrat, de prévoir des méthodes administration (désactivation, récupération de balance ...).
Il est très important que les besoins en administration soient bien identifiés en amont, puis développés et sécurisés.

Il serait dommage de ne pas pouvoir récupérer les Ether que nous avons pu généré par notre travail, ou que quelqu'un les récupère à notre place.

<a name="18"></a>
## 18 Exercices

1) Ajouter un champ "From", pour afficher "Hello X, from Y" !

2) Limiter le prix du changement de nom à 5 ETH. Tous les ETH supplémentaires seront rendus à l'émetteur.
```
contract PayableHello is owned {

	...

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
    	uint256 purchaseExcess = 0;
    	
    	if(msg.value > 5 ether) {
    		purchaseExcess = (msg.value - 5 ether);
    		msg.sender.transfer(purchaseExcess);
    	}
    	
        name = newName;
        emit NameChanged(newName, msg.sender, (msg.value-purchaseExcess));
    }

	...

}
```

3) Créer un événement pour les withdraw, et les afficher à l'écran

**PayableHello.sol**

```javascript
contract PayableHello is owned {

    string private name;

	event NameChanged(string newName, address userAddress, uint value);
	event Withdraw(address ownerAddress, uint balance);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName, msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
		msg.sender.transfer(balance);
		emit Withdraw(msg.sender, balance);
    }

    function() external payable {
        revert();
    }

}
```

**payablehelo.js**

```javascript
/*
* Get all Withdraw events data
*/
exports.getWithdrawHistory = function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {

		// get all emited events from first block to last block
		payableHello.getPastEvents("Withdraw", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
					var valueInEth = web3.utils.fromWei(item.returnValues.balance.toString(), 'ether');
					eventsList.push({ ownerAddress:item.returnValues.ownerAddress, balance:valueInEth});
				});
				resolve(eventsList);
			});
	});
}
```

**app.js**

```javascript
async function renderIndex(res) {

	try {
		displayData.nodeInfo = await payableHello.getNodeInfo();
		displayData.name = await payableHello.readName();
		displayData.nameHistory = await payableHello.getNameChangedHistory();
		displayData.withdrawHistory = await payableHello.getWithdrawHistory();
	}
	catch(error) {
		console.error(error);
	}

	res.render('index', displayData);
}
```

**index.pug**

```html

		...
		
		.row
			.col-md-6
				div.card
					h3.card-header Names history
					div.card-body
						ul
						each item in nameHistory
							li= 'Block '+item.block +' -> '+item.name + ' ('+item.userAddress+', '+item.value+')'
			.col-md-6
				div.card
					h3.card-header Withdraws history
					div.card-body
						ul
						each item in withdrawHistory
							li= 'Transfer '+item.balance +' to '+item.ownerAddress

```

4) Créer un test qui valide que le withdraw fonctionne (balance contrat = 0, balance admin += balance contrat - gaz)

```
it("should withdraw contract balance", async () => {
	let hello = await Hello.deployed();
	let initialContractBalance = await web3.eth.getBalance(hello.address);
	let initialUserBalance = await web3.eth.getBalance(accounts[0]);

	let gas = await hello.withdraw.estimateGas({ from: accounts[0], gas: 4000000 }	);
	let receipt = await hello.withdraw.sendTransaction( { from: accounts[0], gas: gas*2 });

	let gasUsed = receipt.receipt.gasUsed;
	let tx = await web3.eth.getTransaction(receipt.tx);
	let gasPrice = tx.gasPrice;
	let txPrice = (gasPrice * gasUsed);

	let finalContractBalance = await web3.eth.getBalance(hello.address);
	let finalUserBalance = await web3.eth.getBalance(accounts[0]);

	assert.equal(finalContractBalance, 0,"contract balance is not 0");
	assert.equal(t(finalUserBalance), t(parseInt(initialContractBalance,10) + parseInt(initialUserBalance,10) - parseInt(txPrice,10)) ,"user balance is not initial balance + contract balance - tx price");
});
```

<a name="19"></a>
## 19 Ressources

Code source du projet : [https://github.com/avysel/ethereum-helloworld](https://github.com/avysel/ethereum-helloworld)

Truffle : [https://truffleframework.com/docs/truffle/overview](https://truffleframework.com/docs/truffle/overview)

Ganache : [https://truffleframework.com/docs/ganache/overview](https://truffleframework.com/docs/ganache/overview)

Web3.js : [https://web3js.readthedocs.io/en/1.0/](https://web3js.readthedocs.io/en/1.0/)

Solidity : [https://solidity.readthedocs.io/en/latest/](https://solidity.readthedocs.io/en/latest/)

Asynchronicité en javascript : [https://javascript.info/async](https://javascript.info/async)

