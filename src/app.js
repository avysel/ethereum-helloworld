var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var stringify = require('json-stringify-safe');
var config = require("./config.js");
var payableHello = require('./payablehello'); // app services

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))


var displayData = {};
displayData.nodeInfo = null;
displayData.name = null;
displayData.txStatus = null;
displayData.blockNumber = null;
displayData.withdrawStatus = null;
displayData.nameHistory = null;
displayData.paymentHistory = null;
displayData.withdrawHistory = null;
displayData.errorMessage = null;
displayData.accounts = config.accounts;


function renderIndex(res) {

	// chain promises to get all data to display

	payableHello.getNodeInfo() // first, get node info
	.then(
		(nodeInfo) => {
			displayData.nodeInfo = nodeInfo;
			return payableHello.readName();
		},
		(error) => {
			console.error
		}
	).then( // then, get stored name
		(name) => {
			console.log("Name : "+name);
			displayData.name = name;
			return payableHello.getNameChangedHistory();
		},
        (error) => {
        	console.log("Error : "+error);
        	res.render('index', displayData);
        }
    ).then( // then, get names history
		(history) => {
			console.log("history : "+history);
			displayData.nameHistory = history;

			console.log("Render index with : "+stringify(displayData));
			res.render('index', displayData);
		},
		(error) => {
			console.error("renderIndex error : ");
			console.error(error);
		}
    );
}

/**
* Display home page
*/
app.get('/', async function(req, res) {
	renderIndex(res);
});

/**
* Update name
*/
app.post('/name', function(req, res) {
	console.log("POST name : "+stringify(req.body));

	var promiseUpdateName;

	if(req.body.account === config.account) {
		// use default account activated on blockchain
		console.log("Use default account, create regular tx.");
		promiseUpdateName = payableHello.updateName(req.body.newName, req.body.price);
	}
	else {
		// use another account from default one, need to sign a raw transaction
		console.log("Use other account, create raw tx.");
		promiseUpdateName = payableHello.sendRawTransaction(req.body.newName, req.body.price, req.body.account);
	}

	// execute the selected promise
	try {
		promiseUpdateName
		.then(
			(result) => {
				displayData.txStatus = result.txHash;
				displayData.blockNumber = result.blockNumber;
				displayData.errorMessage = result.errorMessage;
				res.redirect("/");
			},
			(error) => {
				console.error("promiseUpdateName error : ");
            	console.error(error);
            	displayData.errorMessage = error;
				res.redirect("/");
			}
		);
	}
	catch(error){
		console.error("POST /name Catch error : ");
		console.error(error.message);
		displayData.errorMessage = error;
		res.redirect("/");
	}
});


/**
* Withdraw contract balance
*/
app.get('/withdraw', function(req, res) {

	console.log("GET withdraw");
	payableHello.withdraw()
	.then(
		(result) => {
			displayData.txStatus = result.txHash;
			displayData.blockNumber = result.blockNumber;
			displayData.errorMessage = result.errorMessage;
			res.redirect("/");
		},
		(error) => {
			res.redirect("/");
		}
	);
});

// init blockchain connection
payableHello.connection();
payableHello.initContracts();

// start server
app.listen(3000);
