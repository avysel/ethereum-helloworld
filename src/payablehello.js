/**
* TODO
* - remove DOM function, replace by callback
* - move to web3 1.0
* - create provider from metamask
* - export parameters in properties file
* - Rename refresh to getInfo and create json return object
*/

var exports = module.exports = {};

var payableHelloContractAddress = "0xdF3979E65b44dd336A9d9fC2F0825f76dB94345c"; // contract address
var payableHello = null; // contract methods

/*
* Connect to blockchain
*/
exports.connection = function() {

	console.log("");
	console.log("--- Connection ---");

	// use provider to connect to blockchain node
	if (typeof web3 !== 'undefined') {
		console.log('Use current provider');
		web3 = new Web3(web3.currentProvider);
	} else {
		console.log('Use http provider');
		web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
	}
}

/*
* Load contract's methods with ABI
*/
exports.loadContract = function() {
	payableHello = web3.eth.contract(payableHelloWorldABI).at(payableHelloContractAddress);
	console.log("Contract loaded at "+payableHelloContractAddress);
}

/*
* Call change name function and wait for event
*/
exports.updateName = function(newName, price) {

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
exports.sendRawTransaction = function(newName, price, address, privateKey) {
	console.log("Start creating raw tx from "+address);
	// create raw tx
	var tx = new ethereumjs.Tx({
	  nonce: web3.toHex(web3.eth.getTransactionCount(address)),
      gasPrice: web3.toHex(web3.toWei('20', 'gwei')),
      gasLimit: web3.toHex(4000000),
      to: payableHelloContractAddress,
      value: web3.toHex(web3.toWei(price, "ether")),
      data: web3.toHex(payableHello.setName.getData(newName))
    });
	console.log("tx : "+tx);
    // sign raw tx
    tx.sign(ethereumjs.Buffer.Buffer.from(privateKey, 'hex'));

	// send raw tx
    var raw = '0x' + tx.serialize().toString('hex');
    console.log("Raw : "+raw);
   	var txHash = web3.eth.sendRawTransaction(raw);
   	console.log("tx hash" + txHash)
	document.getElementById("status").innerHTML = "Waiting for tx "+txHash;

   	// wait for result
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
* Read the name from smart contract
*/
exports.readName = function() {
	var name = payableHello.getName.call();
	return name;
}

/**
* Retreive contract balance. Only works for contract owner
*/
exports.withdraw = function() {

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

/*
* Get connection info
*/
exports.refresh = function() {
	document.getElementById("web3-version").innerHTML = web3.version.api;
	document.getElementById("node").innerHTML = web3.version.node;
    document.getElementById("block-number").innerHTML = web3.eth.blockNumber;
    document.getElementById("coinbase").innerHTML = web3.eth.coinbase;
    document.getElementById("balance").innerHTML = web3.fromWei(web3.eth.getBalance(web3.eth.coinbase).toNumber(), 'ether');
    document.getElementById("contract-balance").innerHTML = web3.fromWei(web3.eth.getBalance(payableHelloContractAddress).toNumber(), 'ether');
}
