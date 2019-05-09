/**
* TODO
* - create provider from metamask
*/

var Web3 = require("web3");
var EthereumTx = require("ethereumjs-tx");
var fs = require('fs');
var stringify = require('json-stringify-safe');
var config = require("./config.js");
var BigNumber = require('bignumber.js');

var exports = module.exports = {};

var payableHello = null; // contract methods
var web3 = null;

// object to return the result of a request on blockchain
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

	// read ABI from file
	var parsed = JSON.parse(fs.readFileSync(config.abiFile));
	var payableHelloWorldABI = parsed.abi;

	// load contracts methods at contract address, using ABI
	payableHello = new web3.eth.Contract(payableHelloWorldABI, config.payableHelloContractAddress);

	console.log("Load contract at : "+config.payableHelloContractAddress);
}

/**
* Read the name from smart contract
*/
exports.readName = async function() {
	return payableHello.methods.getName().call({from: config.account});
}

/*
* Call change name function and wait for event
* newName : the new name to set
* price : the number of ethers we pay to change the name
*/
exports.updateName = async function(newName, price) {

	console.log("> call updateName : "+newName+", "+price);

	// object containing return values
	var result = new RequestResult();

	// estimate gas cost
	var gasAmount = await payableHello.methods.setName(newName).estimateGas({from: config.account, gas: 5000000, value: web3.utils.toWei(price, "ether")});
	result.gas = gasAmount;

	var promiseSetName = new Promise( function (resolve, reject){

		// send a transaction to setName
		payableHello.methods.setName(newName).send({from: config.account, gas: gasAmount, value: web3.utils.toWei(price, "ether")})
		.on('transactionHash', (hash) => {
				// when tx hash is known
			   console.log("tx hash : "+hash);
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
		   		// when receipt is created
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
		   		// when tx is confirmed
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
	}); // end of promiseSetName, result to return

	return promiseSetName;
}

/**
* Update name using smart contract, using account different from default one
* newName : the new name to set
* price : the number of ethers we pay to change the name
* address : the address used to send tx
*/
exports.sendRawTransaction = async function(newName, price, address) {

	console.log("> call raw updateName from "+address);

	var result = new RequestResult();
	var plainPrivateKey = null;

	// get privake key from config according for sender address
	config.accounts.forEach(function(element) {
		if(element.address === address){
			plainPrivateKey = element.pk;
		}
	});

	// get tx count for address
	var txCount = await web3.eth.getTransactionCount(address);

	// create tx
	var txParams = {
		from: address,
		nonce: web3.utils.toHex(txCount),
		gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
		gasLimit: web3.utils.toHex(4000000),
		to: config.payableHelloContractAddress,
		value: web3.utils.toHex(web3.utils.toWei(price, "ether")),
		data: web3.utils.toHex(payableHello.methods.setName(newName).encodeABI())
	}

	// estimate tx gas cost
	var gasAmount = await web3.eth.estimateGas(txParams);
	result.gas = gasAmount;

	// update gas limit
	txParams.gasLimit = web3.utils.toHex(gasAmount);

	// create result promise that will be resolved when tx is confirmed
	var promiseSendRawTx = new Promise( function (resolve, reject){

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


	}); // end of promiseSendRawTx, to be returned

	return promiseSendRawTx;
}

/**
* Retreive contract balance. Only works for contract owner
* withdrawAccount : the address to send ethers to
*/
exports.withdraw = async function(withdrawAccount) {

	console.log("> call withdraw to "+withdrawAccount);

	var result = new RequestResult();

	// estimate gas cost
	var gasAmount = await payableHello.methods.withdraw().estimateGas({from: withdrawAccount, gas: 5000000});
	result.gas = gasAmount;

	var promiseWithdraw = new Promise( function (resolve, reject){

		// send tx to withdraw function
		payableHello.methods.withdraw().send({from: withdrawAccount, gas: gasAmount*2})
		.on('transactionHash', (hash) => {
			   console.log("tx hash : "+hash);
			   result.txHash = hash;
		   })
		   .on('receipt', (receipt) => {
			   console.log("receipt");
		   })
		   .on('confirmation', (confirmationNumber, receipt) => {
			   console.log("confirmation");
			  // console.log(stringify(receipt));
			   result.blockNumber = receipt.blockNumber;
			   resolve(result);
		   })
		   .on('error',(error) => {
				console.error(error);
				result.errorMessage = error;
				reject(result);
		   });
	});

	return promiseWithdraw;
}

/*
* Get connection info
* Return Promise<Object{web3Version, blockNumber, nodeInfo, balance, contractBalance}>
*/
exports.getNodeInfo = async function() {

	var nodeInfo = {
		web3Version:  web3.version
	};

	// get all blockchain info from current node
	nodeInfo.blockNumber = await web3.eth.getBlockNumber();
	nodeInfo.coinbase = await web3.eth.getCoinbase();
	nodeInfo.node = await web3.eth.getNodeInfo();
	nodeInfo.balance = web3.utils.fromWei(await web3.eth.getBalance(config.account), 'ether');
	nodeInfo.contractBalance = web3.utils.fromWei(await web3.eth.getBalance(config.payableHelloContractAddress), 'ether');

	return nodeInfo;

}

/*
* Get all NameChanged events data
*/
exports.getNameChangedHistory = async function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {

		// get all emited events from first block to last block
		payableHello.getPastEvents("NameChanged", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
					var valueInEth = web3.utils.fromWei(item.returnValues.value.toString(), 'ether');
				  	eventsList.push({ block:item.blockNumber, name:item.returnValues.newName, userAddress:item.returnValues.userAddress, value:valueInEth});
				});
				resolve(eventsList);
			});
	});
}

/*
* Get all Withdraw events data
*/
exports.getWithdrawHistory = function() {
	var eventsList = new Array();

	return new Promise(function(resolve, reject) {

		// get all emited events from first block to last block
		payableHello.getPastEvents("Withdraw", { fromBlock: 0, toBlock: 'latest' })
			.then((events, error) => {
				events.forEach(function(item, index, array) {
				  eventsList.push({ ownerAddress:item.returnValues.ownerAddress, balance:item.returnValues.balance});
				});
				resolve(eventsList);
			});
	});
}