/**
* TODO
* - remove DOM function, replace by callback
* - move to web3 1.0
* - create provider from metamask
* - export parameters in properties file
* - Rename refresh to getInfo and create json return object
*/

var Web3 = require("web3");
var abi = require("./payablehelloworld-abi");

var exports = module.exports = {};

var payableHelloContractAddress = "0xdF3979E65b44dd336A9d9fC2F0825f76dB94345c"; // contract address
var nodeUrl = "";
var payableHello = null; // contract methods
var web3 = null;

function RequestResult(txHash, gas, data, errorMessage) {
	this.txHash = txHash;
	this.gas = gas;
	this.data = data;
	this.errorMessage = errorMessage;
}

/*
* Connect to blockchain
*/
exports.connection = function() {

	console.log("");
	console.log("--- Connection ---");

	const options = {
		defaultAccount: '0xdF3979E65b44dd336A9d9fC2F0825f76dB94345c',
		defaultBlock: 'latest',
		defaultGas: 1,
		defaultGasPrice: 0,
		transactionBlockTimeout: 50,
		transactionConfirmationBlocks: 24,
		transactionPollingTimeout: 480,
		transactionSigner: null
	}

	web3 = new Web3(Web3.givenProvider || 'http://localhost:7545', null, options);

}

/*
* Load contract's methods with ABI
*/
exports.initContracts = function() {
	var payableHelloWorldABI = abi.payableHelloWorldABI;
		const options = {

    	};
	payableHello = web3.eth.Contract(payableHelloWorldABI, payableHelloContractAddress, options);
	console.log("Contract loaded at "+payableHelloContractAddress);
}

/*
* Call change name function and wait for event
*/
exports.updateName = function(newName, price) {

	var result = new RequestResult();
	
	try {
		var gas = payableHello.setName.estimateGas(newName, { from: web3.eth.coinbase, gas: 4000000, value: web3.toWei(price, "ether") }	);
		console.log("Update name gas : "+gas);
		result.gas = gas;
		var txHash = payableHello.setName.sendTransaction(newName, { from: web3.eth.coinbase, gas: gas, value: web3.toWei(price, "ether") });
		console.log("Update name tx hash : "+txHash);
		result.txHash = txHash;
		//document.getElementById("status").innerHTML = "Waiting for tx "+txHash;
	}
	catch(error) {
		console.log(error);
		//document.getElementById("status").innerHTML = error;
		result.errorMessage = error;
		return result;
	}

	var updateNameEvent = payableHello.NameChanged();
	updateNameEvent.watch(function(error, result) {
		if(error){
			console.log("Error");
			//document.getElementById("content").innerHTML = "Error "+error;
			result.errorMessage = error;
			return result;
		}
		//document.getElementById("status").innerHTML = "Tx "+txHash+" validated !";
		result.data = readName();
		updateNameEvent.stopWatching();
		return result;
	});
}

/**
* Update name using smart contract, using account different from default one
*/
exports.sendRawTransaction = function(newName, price, address, privateKey) {
	
	var result = new RequestResult();
	
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
   	console.log("tx hash" + txHash);
	result.txHash = txHash;
	//document.getElementById("status").innerHTML = "Waiting for tx "+txHash;

   	// wait for result
	var updateNameEvent = payableHello.NameChanged();
	updateNameEvent.watch(function(error, result) {
		if(error){
			console.log("Error");
			//document.getElementById("content").innerHTML = "Error "+error;
			result.errorMessage = error;
			return result;
		}
		//document.getElementById("status").innerHTML = "Tx "+txHash+" validated !";
		result.data = readName();
		updateNameEvent.stopWatching();
		return result;
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
	var nodeInfo = {"web3-version":  web3.version.api
			, "node": web3.version.node
			, "block-number": web3.eth.blockNumber
			, "coinbase": web3.eth.coinbase
			, "balance":  web3.fromWei(web3.eth.getBalance(web3.eth.coinbase).toNumber(), 'ether')
			, "contract-balance": web3.fromWei(web3.eth.getBalance(payableHelloContractAddress).toNumber(), 'ether')
		       };
	return nodeInfo;
}
