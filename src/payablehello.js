/**
* TODO
* - create provider from metamask
*/

var Web3 = require("web3");
var fs = require('fs');
var config = require("./config.js");
var stringify = require('json-stringify-safe');

var exports = module.exports = {};

var payableHello = null; // contract methods
var web3 = null;

function RequestResult(txHash, blockNumber, gas, data, errorMessage) {
	this.txHash = txHash;
	this.blockNumber = blockNumber
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

/**
* Read the name from smart contract
*/
exports.readName = function() {

	return payableHello.methods.getName().call({from: config.account});

}

/*
* Call change name function and wait for event
*/
exports.updateName = function(newName, price) {

	console.log("> call updateName");

	var result = new RequestResult();

	var promiseSetName = new Promise( function (resolve, reject){

		payableHello.methods.setName(newName).estimateGas({from: config.account, gas: 5000000, value: web3.utils.toWei(price, "ether")})
		.then(function(gasAmount){

			console.log("gas amount : "+gasAmount);
			result.gas = gasAmount;

			payableHello.methods.setName(newName).send({from: config.account, gas: gasAmount, value: web3.utils.toWei(price, "ether")})
			.on('transactionHash', (hash) => {
				   console.log("tx hash : "+hash);
				   result.txHash = hash;
			   })
			   .on('receipt', (receipt) => {
				   console.log("receipt");
			   })
			   .on('confirmation', (confirmationNumber, receipt) => {
				   console.log("confirmation");
				   resolve(result);
			   })
			   .on('error',(error) => {
			   		console.error(error);
			   		result.errorMessage = error;
			   		reject(result);
			   });
		})
		.catch(function(error){
			console.error("Error : "+error);
		});

	});

	return promiseSetName;
}

/**
* Update name using smart contract, using account different from default one
*/
exports.sendRawTransaction = function(newName, price, address, privateKey) {
	
	console.log("> call raw updateName from "+address);

	var result = new RequestResult();

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
* Retreive contract balance. Only works for contract owner
*/
exports.withdraw = function() {

	console.log("> call withdraw");

	var result = new RequestResult();

	var promiseWithdraw = new Promise( function (resolve, reject){

		payableHello.methods.withdraw().estimateGas({from: config.account, gas: 5000000})
		.then(function(gasAmount){

			console.log("gas amount : "+gasAmount);
			result.gas = gasAmount;

			payableHello.methods.withdraw().send({from: config.account, gas: gasAmount*2})
			.on('transactionHash', (hash) => {
				   console.log("tx hash : "+hash);
				   result.txHash = hash;
			   })
			   .on('receipt', (receipt) => {
				   console.log("receipt");
			   })
			   .on('confirmation', (confirmationNumber, receipt) => {
				   console.log("confirmation");
				   console.log(stringify(receipt));
				   resolve(result);
			   })
			   .on('error',(error) => {
			   		console.error(error);
			   		result.errorMessage = error;
			   		reject(result);
			   });
		})
		.catch(function(error){
			console.error("Error : "+error);
		});

	});

	return promiseWithdraw;

}

/*
* Get connection info
* Return Promise<Object{web3Version, blockNumber, nodeInfo, balance, contractBalance}>
*/
exports.getNodeInfo = function() {

	var nodeInfo = {
		web3Version:  web3.version
	};

	var promiseBlockNumber = web3.eth.getBlockNumber()
	.then(
		(blockNumber) => { nodeInfo.blockNumber = blockNumber; }
		, console.error
	);

	var promiseCoinbase = web3.eth.getCoinbase()
	.then(
		(coinbase) => { nodeInfo.coinbase = coinbase; }
		, console.error
	);

	var promiseNodeInfo = web3.eth.getNodeInfo()
	.then(
		(node) => { nodeInfo.node = node; }
		, console.error
	);

	var promiseBalanceAccount = web3.eth.getBalance(config.account)
	.then(
		(balance) => { nodeInfo.balance = web3.utils.fromWei(balance, 'ether'); }
		, console.error
	);

	var promiseBalanceContract = web3.eth.getBalance(config.payableHelloContractAddress)
	.then(
		(balance) => { nodeInfo.contractBalance = web3.utils.fromWei(balance, 'ether'); }
		, console.error
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

exports.getNameChangedHistory = function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {
		payableHello.getPastEvents("NameChanged", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
				  eventsList.push({ block:item.blockNumber, name:item.returnValues.newName});
				});
				resolve(eventsList);
			});
	});
}

exports.getPaymentReceiptHistory = function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {
		payableHello.getPastEvents("PaymentReceipt", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
				  eventsList.push({ userAddress:item.userAddress, value:item.returnValues.value});
				});
				resolve(eventsList);
			});
	});
}

exports.getWithdrawHistory = function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {
		payableHello.getPastEvents("Withdraw", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
				  eventsList.push({ ownerAddress:item.ownerAddress, balance:item.returnValues.balance});
				});
				resolve(eventsList);
			});
	});
}


