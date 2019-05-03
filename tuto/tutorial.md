# Comment développer une application Ethereum ?

Dans ce tutoriel, nous allons voir comment développer une application couplée à la blockchain Ethereum.


## Introduction

Ethereum permet la création de smart contracts. Ce sont des programmes qui sont envoyés à tous les noeuds du réseau et dont on active des fonctionnalités au moyen de transactions.
Ils vont donc s'exécuter sur tous les noeuds dès que ces derniers recevront la transaction correspondante.

Les smart contracts sont écrits en Solidity, un langage créé pour Ethereum. Ils sont exécutés dans l'EVM (Ethereum Virtual Machine). C'est une machine à pile d'exécution. C'est à dire que le programme est décompoé en une suite d'instructions de base, placées sur une pile, et exécutées dans l'ordre de dépilage.

La documentation officielle du langage est disponible ici : 
https://solidity.readthedocs.io/en/latest/

Il est ensuite possible de connecter une application traditionnelle à un smart contract.

## Mise en garde

Il faut garder à l'esprit que l'état de l'environnement d'exécution peut varier d'un noeud à l'autre. Par exemple, selon qu'un autre transaction ait déjà été reçu ou pas encore par tel ou tel noeud. La conception des smart contracts ne doit donc pas être dépendante de l'environnement.

Ensuite, comme tout élément stocké sur la blockchain, une fois validés, ils sont immuables. C'est à dire qu'il est impossible de mettre à jour ou supprimer un smart contract. D'où l'importance de mettre l'accent sur la qualité lors des développement.

Une mise à jour de smart contract équivaut au déploiement d'un nouveau smart contract. L'ancien restera toujours présent, avec ses données. Il pourra cependant être désactivé, mais ne sera jamais complètement supprimé.

## DApp ?

Une DApp, ou Decentralized Application, application décentralisée, est une application déployée sur un réseau de façon uniforme et partagée, qui ne possède aucun élément central et nécessaire à son fonctionnement.

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

- NodeJS : car le projet sera développé en Node.js :)
- Ganache : une blockchain de test, qui s'exécute en local et fournit une interface visuelle pour voir ce qu'il s'y passe.
- Truffle : un outil permettant de copiler, tester et déployer des smart contracts sur une blockchain.
- Web3.js : un framework javascript permettant d'interagir avec une blockchain.

## Initialisation de l'espace de travail

Positionnez vous dans votre répertoire de travail, et lancez la commande suivante :

 ```truffle init```
 

## 2. Premier smart contract