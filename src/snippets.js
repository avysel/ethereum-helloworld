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
