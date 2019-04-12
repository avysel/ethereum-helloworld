var helloWorldABI = [
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
                    		"inputs": [
                    			{
                    				"name": "newName",
                    				"type": "string"
                    			}
                    		],
                    		"name": "setName",
                    		"outputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "function"
                    	},
                    	{
                    		"inputs": [],
                    		"payable": false,
                    		"stateMutability": "nonpayable",
                    		"type": "constructor"
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
                    	}
                    ];