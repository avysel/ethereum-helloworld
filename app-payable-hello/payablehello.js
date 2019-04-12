var payableHelloContractAddress = "0xdF3979E65b44dd336A9d9fC2F0825f76dB94345c";
var payableHello = null;

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
}

function refresh() {
    document.getElementById("block-number").innerHTML = web3.eth.blockNumber;
    document.getElementById("coinbase").innerHTML = web3.eth.coinbase;
    document.getElementById("balance").innerHTML = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase).toNumber(), 'ether') ;
    document.getElementById("contract-balance").innerHTML = web3.fromWei(web3.eth.getBalance(payableHelloContractAddress).toNumber(), 'ether') ;
}

/**
* Load Hello smart contract
*/
function loadContract() {
	payableHello = web3.eth.contract(payableHelloWorldABI).at(payableHelloContractAddress);
	console.log("Contract loaded at "+payableHelloContractAddress);
}

/**
* Form submission function, calls the smart contract function
*/
function changeName() {
	console.log("Request name change");
	var newName = document.getElementById("newName").value;
	var price = document.getElementById("price").value;
	var address = document.getElementById("address").value;
	var pk = document.getElementById("pk").value;

	if(!address && !pk) {
		updateName(newName, price);
	}
	else {
		sendRawTransaction(newName, price, address, pk);
	}
}

/**
* Update name using smart contract, using default account
*/
function updateName(newName, price) {

	try {
		var gas = payableHello.setName.estimateGas(newName, { from: web3.eth.coinbase, gas: 4000000, value: web3.toWei(price, "ether") }	);
		console.log("Update name gas : "+gas)
		var txHash = payableHello.setName.sendTransaction(newName, { from: web3.eth.coinbase, gas: gas, value: web3.toWei(price, "ether") });
		console.log("Update name tx hash : "+txHash);
		document.getElementById("status").innerHTML = "Waiting for tx "+txHash;
	}
	catch(error) {
		console.log(error);
		document.getElementById("status").innerHTML = error;
	}

	var updateNameEvent = payableHello.NameChanged();
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
* Update name using smart contract, using account different from default one
*/
function sendRawTransaction(newName, price, address, privateKey) {
	var tx = {
	  // this could be provider.addresses[0] if it exists
	  from: address,
	  // target address, this could be a smart contract address
	  to: payableHelloContractAddress,
	  // optional if you want to specify the gas limit
	  gas: 4000000,
	  // optional if you are invoking say a payable function
	  value: web3.toWei(price, "ether"),
	  // this encodes the ABI of the method and the arguements
	  data: payableHello.setName(newName).encodeABI()
	};

	var signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
}

/**
* Read the name from smart contract
*/
function readName() {
	var name = payableHello.getName.call();
	document.getElementById("content").innerHTML = "Hello "+name+" ! ";
}

/**
* Retreive contract balance
*/
function withdraw() {
	/*var result = payableHello.withdraw.call();
	console.log(result);*/

	var gas = payableHello.withdraw.estimateGas({ from: web3.eth.coinbase, gas: 4000000 }	);
	console.log("withdraw gas : "+gas)
	var txHash = payableHello.withdraw.sendTransaction( { from: web3.eth.coinbase, gas: gas*2 });
	console.log("withdraw tx hash : "+txHash);
	document.getElementById("withdraw-status").innerHTML = "Waiting ...";

	var withdrawEvent = payableHello.Withdraw();
	withdrawEvent.watch(function(error, result) {
		if(error){
			console.log("Error");
			document.getElementById("withdraw-status").innerHTML = "Error "+error;
			return;
		}
		document.getElementById("withdraw-status").innerHTML = "Completed";
		refresh();
		withdrawEvent.stopWatching();
		return;
	});
}

/**
* On page load, connect to blockchain, load contract and read current name.
*/
window.onload = function() {
	connection();
	loadContract();
	readName();
	setInterval(refresh, 1000);
}
