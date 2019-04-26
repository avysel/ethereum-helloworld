/**
* TODO
* - remove DOM function, replace by callback
* - move to web3 1.0
* - create provider from metamask
*/

var Web3 = require("web3");
var fs = require('fs');
var config = require("./config.js");
var stringify = require('json-stringify-safe');

var exports = module.exports = {};

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

	const options = {
		defaultAccount: config.account,
	/*	defaultBlock: 'latest',
		defaultGas: 1,
		defaultGasPrice: 0,
		transactionBlockTimeout: 50,
		transactionConfirmationBlocks: 24,
		transactionPollingTimeout: 480,
		transactionSigner: null*/
	}

	web3 = new Web3(Web3.givenProvider || config.nodeURL+':'+config.nodePort, null, options);
	console.log("Connected to "+config.nodeURL+':'+config.nodePort);

}

/*
* Load contract's methods with ABI
*/
exports.initContracts = function() {

	var parsed = JSON.parse(fs.readFileSync(config.abiFile));
	var payableHelloWorldABI = parsed.abi;
	payableHello = new web3.eth.Contract(payableHelloWorldABI, config.payableHelloContractAddress);
	console.log("Load contract at : "+config.payableHelloContractAddress);
}

/*
* Call change name function and wait for event
*/
exports.updateName = function(newName, price) {

	var result = new RequestResult();
	
	try {


		/*payableHello.setName(newName).estimateGas({gas: 5000000}, function(error, gasAmount){
			if(gasAmount == 5000000)
				console.log('Method ran out of gas');
		});*/

		payableHello.setName(newName).estimateGas({from: config.account, gas: 5000000, value: web3.toWei(price, "ether")})
		.then(function(gasAmount){
			console.log("gas amount : "+gasAmount);
		})
		.catch(function(error){
			console.log("Error : "+error);
		});


		/*var gas = payableHello.setName.estimateGas(newName, { from: web3.eth.coinbase, gas: 4000000, value: web3.toWei(price, "ether") }	);
		console.log("Update name gas : "+gas);
		result.gas = gas;
		var txHash = payableHello.setName.sendTransaction(newName, { from: web3.eth.coinbase, gas: gas, value: web3.toWei(price, "ether") });
		console.log("Update name tx hash : "+txHash);
		result.txHash = txHash;*/
		//document.getElementById("status").innerHTML = "Waiting for tx "+txHash;
	}
	catch(error) {
		console.log(error);
		//document.getElementById("status").innerHTML = error;
		result.errorMessage = error;
		return result;
	}
/*
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
	});*/
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
      to: config.payableHelloContractAddress,
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

	return payableHello.methods.getName().call({from: config.account});

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
* Return Promise<Object{web3Version, blockNumber, nodeInfo, balance, contractBalance}>
*/
exports.getNodeInfo = function() {

	var nodeInfo = {
			web3Version:  web3.version
		    };
/*
	web3.eth.getBlockNumber()
	.then(function(blockNumber) {
		nodeInfo.blockNumber = blockNumber;
		console.log("blockNumber : "+blockNumber);
		return web3.eth.getCoinbase();
	})
	.then(function(coinbase) {
		nodeInfo.coinbase = coinbase;
		console.log("coinbase : "+coinbase);
		return web3.eth.getNodeInfo();
	})
	.then(function(node) {
		nodeInfo.node = node;
		console.log("node : "+node);
		return web3.eth.getBalance(config.account);
	})
	.then(function(balance) {
		nodeInfo.balance = web3.utils.fromWei(balance, 'ether');
		console.log("balance : "+balance);
		return web3.eth.getBalance(config.payableHelloContractAddress);
	})
	.then(function(balance) {
		nodeInfo.contractBalance = web3.utils.fromWei(balance, 'ether');
		console.log("balance : "+balance);
		console.log(stringify(nodeInfo));
		return nodeInfo;
	});

	console.log("return");

return new Promise(function(resolve, reject) {


					resolve(nodeInfo);
					}
				);
*/

	var promiseBlockNumber = web3.eth.getBlockNumber()
	.then(
		(blockNumber) => { nodeInfo.blockNumber = blockNumber; }
		, console.log
	);

	var promiseCoinbase = web3.eth.getCoinbase()
	.then(
		(coinbase) => { nodeInfo.coinbase = coinbase; }
		, console.log
	);

	var promiseNodeInfo = web3.eth.getNodeInfo()
	.then(
		(node) => { nodeInfo.node = node; }
		, console.log
	);

	var promiseBalanceAccount = web3.eth.getBalance(config.account)
	.then(
		(balance) => { nodeInfo.balance = web3.utils.fromWei(balance, 'ether'); }
		, console.log
	);

	var promiseBalanceContract = web3.eth.getBalance(config.payableHelloContractAddress)
	.then(
		(balance) => { nodeInfo.contractBalance = web3.utils.fromWei(balance, 'ether'); }
		, console.log
	);


	return new Promise(function(resolve, reject) {

		Promise.all([promiseBlockNumber, promiseCoinbase, promiseNodeInfo, promiseBalanceAccount, promiseBalanceContract]).then(
			(values) => {
				/*console.log("All promises resolved");
				console.log(stringify(nodeInfo));*/
				resolve(nodeInfo);
			}
			,(error) => { console.log(error); reject(error);}
			);
	});
}
