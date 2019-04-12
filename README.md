# ethereum-helloworld
Hello World smart contract for Ethereum

## Hello
Simple smart contract containing a field "name", a getter and a setter.
The HTML/javascript page displays the name, and provides a form field to change it.

## PayableHello
Same as Hello. But changing the name costs 1 ETH.
User can pay more than 1 ETH, and gets a deposit (event) for any payement.
Contract owner can get ethers owned by its contract.
We can't send Ether to the contract without changing the name