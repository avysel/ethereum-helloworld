var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var stringify = require('json-stringify-safe');
var payableHello = require('./payablehello'); // app services

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))


var displayData = {};
displayData.nodeInfo = null;
displayData.name = null;
displayData.txStatus = null;
displayData.withdrawStatus = null;
displayData.nameHistory = null;
displayData.paymentHistory = null;
displayData.withdrawHistory = null;


function renderIndex(res) {
	payableHello.getNodeInfo()
	.then(
		(nodeInfo) => {
			displayData.nodeInfo = nodeInfo;
			return payableHello.readName();
		},
		(error) => {
			console.error
		}
	).then(
		(name) => {
			console.log("Name : "+name);
			displayData.name = name;
			return payableHello.getNameChangedHistory();
		},
        (error) => {
        	console.log("Error : "+error);
        	res.render('index', displayData);
        }
    ).then(
		(history) => {
			console.log("history : "+history);
			displayData.nameHistory = history;

			console.log("Render index with : "+stringify(displayData));
			res.render('index', displayData);
		},
		(error) => console.error
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
	payableHello.updateName(req.body.newName, req.body.price)
	.then(
		(result) => {
			displayData.txStatus = result.txHash;
			renderIndex(res);
		},
		(error) => {
			res.redirect("/");
		}
	);
});


/**
* Update name with raw transaction
*/
app.post('/name/raw', function(req, res) {

	renderIndex(res);
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
			renderIndex(res);
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
