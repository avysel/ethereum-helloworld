# Comment développer une application Ethereum ?

Dans ce tutoriel, nous allons voir comment développer une application couplée à la blockchain Ethereum.


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
Nous allons utiliser la version 1.0 pour ce tutorial, car elle est bien plus complète et facile d'utilisation que la 0.20, et elle ne présente plus de problème de stabilité. La version 0.20 permet une utilisation directement intégrée à des pages web, dans un navigateur, alors que la version 1.0 impose de passer par une exécution côté serveur telle que Node.js.

***

**Vous êtes prêts ? Alors allons-y !**

***

## 1. Initialisation de l'espace de travail

Dans un terminal, positionnez vous dans votre répertoire de travail, et lancez la commande suivante :

 ```truffle init```
 
Après une courte phase de téléchargement et d'initialisation, nous voyons apparaitre 3 répertoires et 1 fichier :
 
```contracts``` : code des smart contracts

```migrations``` : scripts permettant à Truffle de gérer les déploiements

```tests``` : scripts de tests unitaires des smart contracts

```truffle-config.js``` : fichier de configuration de Truffle

Dans certains de ces répertoires, des fichiers ```*migration*``` on été créés. Ils sont nécessaires à Truffle pour les déploiements de contrats, il ne faut pas les supprimer.

## 2. Premier smart contract

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


## 3. Test du smart contract

Avant de déployer notre smart contract, nous allons le tester en utilisant Remix. C'est un IDE en ligne qui remplit à peu près le même rôle que Truffle. C'est l'occasion de tester un nouvel outil :).

https://remix.ethereum.org


## 4. Déploiement du smart contract

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
Il est possible de définir plusieurs réseaux, et de préciser dans la ligne de commande lequel utilisé. Le premier sera utilisé par défaut si rien n'est indiqué.

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

Vous obtenez différentes informations sur la transaction qui a déployé de contrat (numéro de transaction, prix ...).
Notez bien pour plus tard l'information la plus important, l'adresse à laquelle le smart contract a été déployé ("contract address").