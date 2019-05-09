/*
* Ethereum oracle example
* Reads an API every 10 seconds, get different value each time and use PayableHello to update name with this value
*/

var request = require('request');
var config = require('./config');
var payableHello = require('./payablehello'); // app services

var lastName = null;

async function readAPI() {

	request({url: 'http://127.0.0.1:3001/name', json: true}, async function(err, res, json) {
		 if (err) {
			console.error(err);
		}

		var name = json.name;
		console.log("READ : "+name);

		if(lastName == null || lastName !== name) {
			console.log("Call smart contract");
			var price = "2";

			await payableHello.updateName(name, price)
			.then(
				(result) => {
					console.log(result);
				},
				(error) => {
					console.error(error);
				}
			);
		}

		lastName = name;
    });

}

// init blockchain connection
payableHello.connection();
payableHello.initContracts();

setInterval(readAPI, 1000 * 10);