# ethereum-helloworld
Hello World smart contract & Dapp for Ethereum

2 versions :

-VanillaJS in browser, Web3.js 0.20

-Node.js, Web3.js 1.0

## Hello

Simple smart contract containing a field "name", a getter and a setter.
The HTML/javascript page displays the name, and provides a form field to change it.

To learn how to :
- Connect to blockchain
- Create and deploy a smart contract
- Make a web application communicate with a smart contract (read/write data)
- Wait for transaction to be validated using events


## PayableHello

Same as Hello. But changing the name costs 2 ETH.
User can pay more than 2 ETH, and gets a receipt (event) for any payment.
Contract owner can get ethers owned by its contract.
We can't send Ether to the contract without changing the name

To learn how to :
- Transfert Ether
- Manage contract ownership with modifier
- Manager requirements in a smart contract
- Use fallback function
- Sign and send raw transaction
- Create oracle


## Files
``build/contracts``: compiles contracts and ABIs

``contracts``: smart contracts code

``migrations``: Truffle migration file

``test``: Truffle contracts test files

``src``: Nodejs application, using Web3.js 1.0

``src/oracle.js & api.js``: simple API and Ethereum oracle

``vanilla``: standalone Vanilla Js Hello and PayableHello applications, using Web3.js 0.20, browser-only.


## Requirements
1. Blockchain available (Ganache, local node, etc ...)
2. Contract deployement tool (Truffle, Remix ...)
3. Node.js


## Run
**Start blockchain**

**Deploy contract on blockchain**
- ``truffle deploy`` 
- or with Remix IDE

**Update ``src/config.js`` with**
 - blockchain URL/port
 - default account address
 - available accounts with their private keys
 - contract address
 
**Start application** 

``cd src``

``node app.js``
 
