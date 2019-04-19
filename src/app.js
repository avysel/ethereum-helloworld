var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var stringify = require('json-stringify-safe');
var payableHello = require('./payablehello'); // app services

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))


/**
* Display home page
*/
app.get('/', async function(req, res) {
	payableHello.getNodeInfo().then( (nodeInfo, error) => {
		var result = nodeInfo;

		payableHello.readName().then(
            		(name) => { console.log("Name : "+name); result.name = name; res.render('index', result);}
            		, (error) => { console.log("Error : "+error); res.render('index', result); }
                );
	});
});

/**
* Get name
*/
app.get('/name', function(req, res) {
	var statusInfo = getStatusInfo();
	res.render('index', statusInfo);
	res.render('index', parameters);
});

/**
* Update name
*/
app.post('/name', function(req, res) {
	var statusInfo = getStatusInfo();
	res.render('index', statusInfo);
	var result = payableHello.updateName(req.body.name);
	res.render('index', parameters);
});


/**
* Update name with raw transaction
*/
app.post('/name/raw', function(req, res) {
	var statusInfo = getStatusInfo();
	res.render('index', statusInfo);
});

/**
* Withdraw contract balance
*/
app.get('/withdraw', function(req, res) {
	var statusInfo = getStatusInfo();
	res.render('index', statusInfo);
});

/**
* Get server status
*/
app.get('/status', function(req, res) {
	var statusInfo = getStatusInfo();
	res.render('index', statusInfo);
});

// init blockchain connection
payableHello.connection();
payableHello.initContracts();

// start server
app.listen(3000);
