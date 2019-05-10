/**
* Simple API that provides a new string every minute
*/

var express = require('express');
var stringify = require('json-stringify-safe');
var config = require("./config.js");

var app = express();

app.get('/name', function(req, res) {
	console.log("GET /name");
	var responseBody = new Object();
	var today = new Date();

	// name is Toto-yyyymmddhhmm
	responseBody.name = "Toto-"+today.getFullYear()+(today.getMonth()+1)+today.getDate()+today.getHours()+today.getMinutes();
	console.log("Response : "+responseBody.name);
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(responseBody));

});

// start server on port 3001
app.listen(3001);