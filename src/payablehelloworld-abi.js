var exports = module.exports = {};

exports.payableHelloWorldABI = [
                           	{
                           		"constant": true,
                           		"inputs": [],
                           		"name": "getName",
                           		"outputs": [
                           			{
                           				"name": "",
                           				"type": "string"
                           			}
                           		],
                           		"payable": false,
                           		"stateMutability": "view",
                           		"type": "function"
                           	},
                           	{
                           		"constant": false,
                           		"inputs": [],
                           		"name": "withdraw",
                           		"outputs": [],
                           		"payable": false,
                           		"stateMutability": "nonpayable",
                           		"type": "function"
                           	},
                           	{
                           		"constant": false,
                           		"inputs": [],
                           		"name": "destroy",
                           		"outputs": [],
                           		"payable": false,
                           		"stateMutability": "nonpayable",
                           		"type": "function"
                           	},
                           	{
                           		"constant": false,
                           		"inputs": [
                           			{
                           				"name": "newName",
                           				"type": "string"
                           			}
                           		],
                           		"name": "setName",
                           		"outputs": [],
                           		"payable": true,
                           		"stateMutability": "payable",
                           		"type": "function"
                           	},
                           	{
                           		"inputs": [],
                           		"payable": false,
                           		"stateMutability": "nonpayable",
                           		"type": "constructor"
                           	},
                           	{
                           		"payable": true,
                           		"stateMutability": "payable",
                           		"type": "fallback"
                           	},
                           	{
                           		"anonymous": false,
                           		"inputs": [
                           			{
                           				"indexed": false,
                           				"name": "newName",
                           				"type": "string"
                           			}
                           		],
                           		"name": "NameChanged",
                           		"type": "event"
                           	},
                           	{
                           		"anonymous": false,
                           		"inputs": [
                           			{
                           				"indexed": false,
                           				"name": "userAddress",
                           				"type": "address"
                           			},
                           			{
                           				"indexed": false,
                           				"name": "value",
                           				"type": "uint256"
                           			}
                           		],
                           		"name": "PaymentReceipt",
                           		"type": "event"
                           	},
                           	{
                           		"anonymous": false,
                           		"inputs": [
                           			{
                           				"indexed": false,
                           				"name": "ownerAddress",
                           				"type": "address"
                           			},
                           			{
                           				"indexed": false,
                           				"name": "balance",
                           				"type": "uint256"
                           			}
                           		],
                           		"name": "Withdraw",
                           		"type": "event"
                           	}
                           ];