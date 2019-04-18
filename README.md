# ethereum-helloworld
Hello World smart contract & Dapp for Ethereum

## Hello
Simple smart contract containing a field "name", a getter and a setter.
The HTML/javascript page displays the name, and provides a form field to change it.

To learn how to :
- Connect to blockchain
- Create and deploy a smart contract
- Make a web application communicate with a smart contract (read/write data)
- Wait for transaction to be validated using events

## PayableHello
Same as Hello. But changing the name costs 1 ETH.
User can pay more than 1 ETH, and gets a deposit (event) for any payment.
Contract owner can get ethers owned by its contract.
We can't send Ether to the contract without changing the name

To learn how to :
- Transfert Ether
- Manage contract ownership with modifier
- Manager requirements in a smart contract
- Use fallback function
- Sign and send raw transaction

## Files
- build/contracts : compiles contracts and ABIs
- contracts : smart contracts code
- migrations : Truffle migration file
- src : Nodejs applications, using Web3.js 1.0
- vanilla : Vanilla JS applications, using Web3.js 0.20, browser-only.
 
