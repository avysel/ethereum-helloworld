var helloContractAddress = "0xE211ACf24031395256cE895d8E9Fa535E3F8ED36";
var hello = null;

/**
* Create connection to blockchain
*/
function connection() {
	console.log("Connection to blockchain");
	if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    }
	console.log("Connected");
    document.getElementById("block-number").innerHTML = web3.eth.blockNumber;
    document.getElementById("coinbase").innerHTML = web3.eth.coinbase;
}

/**
* Load Hello smart contract
*/
function loadContract() {
	hello = web3.eth.contract(helloWorldABI).at(helloContractAddress);
	console.log("Contract loaded at "+helloContractAddress);
}

/**
* Form submission function, calls the smart contract function
*/
function changeName() {
	console.log("Request name change");
	var newName = document.getElementById("newName").value;
	updateName(newName);
}

/**
* Update name using smart contract
*/
function updateName(newName) {
	var gas = hello.setName.estimateGas(newName, { from: web3.eth.coinbase, gas: 4000000 }	);
	console.log("Update name gas : "+gas)
	var txHash = hello.setName.sendTransaction(newName, { from: web3.eth.coinbase, gas: gas });
	console.log("Update name tx hash : "+txHash);
	document.getElementById("status").innerHTML = "Waiting for tx "+txHash;

	var updateNameEvent = hello.NameChanged();
	updateNameEvent.watch(function(error, result) {
		if(error){
			console.log("Error");
			document.getElementById("content").innerHTML = "Error "+error;
			return;
		}
		document.getElementById("status").innerHTML = "Tx "+txHash+" validated !";
		readName();
		updateNameEvent.stopWatching();
		return;
	});
}

/**
* Read the name from smart contract
*/
function readName() {
	var name = hello.getName.call();
	document.getElementById("content").innerHTML = "Hello "+name+" ! ";
}

/**
* On page load, connect to blockchain, load contract and read current name.
*/
window.onload = function() {
	connection();
	loadContract();
	readName();
}


