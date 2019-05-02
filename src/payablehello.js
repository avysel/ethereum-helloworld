/**
* TODO
* - create provider from metamask
*/

var Web3 = require("web3");
var EthereumTx = require("ethereumjs-tx");
var fs = require('fs');
var stringify = require('json-stringify-safe');
var config = require("./config.js");

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

	console.log("> call updateName : "+newName+", "+price);

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
				   console.log(receipt);
				   result.blockNumber = receipt.blockNumber;
				   resolve(result);
			   })
			   .on('error',(error) => {
			   		console.error("promiseSetName on error");
			   		console.error(error);
			   		reject(error);
			   });
		})
		.catch(function(error){
			console.error("promiseSetName estimate gas catch");
			console.error(error.message);
			result.errorMessage = error.message;
            resolve(result);
		});

	});

	return promiseSetName;
}

/**
* Update name using smart contract, using account different from default one
*/
exports.sendRawTransaction = function(newName, price, address) {

	console.log("> call raw updateName from "+address);

	var result = new RequestResult();
	var plainPrivateKey = null;

	// get privake key from config according for sender address
	config.accounts.forEach(function(element) {
		if(element.address === address){
			plainPrivateKey = element.pk;
		}
	});

	// create result promise that will be resolved when tx is confirmed
	var promiseSendRawTx = new Promise( function (resolve, reject){

		// need a promise to get tx nonce for given account
		web3.eth.getTransactionCount(address).then(txCount => {

			// create tx parameters
			const txParams = {
				from: address,
				nonce: web3.utils.toHex(txCount),
				gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
				gasLimit: web3.utils.toHex(4000000),
				to: config.payableHelloContractAddress,
				value: web3.utils.toHex(web3.utils.toWei(price, "ether")),
				data: web3.utils.toHex(payableHello.methods.setName(newName).encodeABI())
			}

			web3.eth.estimateGas(txParams).then(function(gasAmount) {

				txParams.gasLimit = web3.utils.toHex(gasAmount); // update gas limit according to estimate

				console.log("tx params : "+stringify(txParams));

				// create raw tx
				const tx = new EthereumTx(txParams);

				// encode pk in hex
				const privateKey = Buffer.from(plainPrivateKey, 'hex');

				// sign tx with private key
				tx.sign(privateKey)

				// serialize tx
				const serializedTx = tx.serialize();

				// send raw tx
				web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
				.on('transactionHash', (hash) => {
					   console.log("tx hash : "+hash);
					   result.txHash = hash;
				   })
				   .on('receipt', (receipt) => {
					   console.log("receipt");
				   })
				   .on('confirmation', (confirmationNumber, receipt) => {
					   console.log("confirmation");
					   console.log(receipt);
					   result.blockNumber = receipt.blockNumber;
					   resolve(result);
				   })
				   .on('error',(error) => {
						console.error("promiseSendRawTx on error : ");
						console.error(error);
						reject(error);
				   });

			})
			.catch(function(error){
				console.error("raw tx estimateGas catch");
				console.error(error.message);
				result.errorMessage = error.message;
				resolve(result);
			}); // end of promise estimateGas

		}); // end of promise getTransactionCount

	}); // end of promiseSendRawTx

	return promiseSendRawTx;
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
				   result.blockNumber = receipt.blockNumber;
				   resolve(result);
			   })
			   .on('error',(error) => {
			   		console.error(error);
			   		result.errorMessage = error;
			   		reject(result);
			   });
		})
		.catch(function(error){
			console.error(error.message);
			result.errorMessage = error.message;
            resolve(result);
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


