# Comment développer une application Ethereum ?

Dans ce tutoriel, nous allons voir comment développer une application couplée à la blockchain Ethereum.

Nous allons dans un premier temps installer un certain nombre d'outils :

- NodeJS
- Truffle
- Ganache
- Web3.js


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
