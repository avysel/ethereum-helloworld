var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var stringify = require('json-stringify-safe');
var payablehello = require('./payablehello'); // app services

var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }))

/**
* Display home page
*/
app.get('/', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});

/**
* Get name
*/
app.get('/name', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});

/**
* Update name
*/
app.post('/name', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});


/**
* Update name with raw transaction
*/
app.post('/name/raw', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});

/**
* Withdraw contract balance
*/
app.get('/withdraw', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});

/**
* Get server status
*/
app.get('/status', function(req, res) {
	var parameters = getParameters(null);
	res.render('index', parameters);
});

// init blockchain connection
payablehello.connection();
payablehello.initContracts();
//payablehello.connectionInfo();

// start server
app.listen(3000);
