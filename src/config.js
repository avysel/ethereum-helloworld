const config = {

	// blockchain node IPC IP and port
	nodeURL: "http://127.0.0.1",
	nodePort: 7545,

	// default account address
	account:"0xdB4524A58c78f0945338fe7fF7c3E5988d413032",
	//account:"0x4a4817F49F7f31a2c639C5C723D4BAA194AD0f77",

	// ABI file of smart contract
	abiFile:"../build/contracts/PayableHello.json",

	// address of deployed contract on blockchain
	payableHelloContractAddress:"0x563bf33faCd7504D9d290deF3ab80De5D21d183C",

	accounts: [
		{
			address: "0xdB4524A58c78f0945338fe7fF7c3E5988d413032",
			pk: null
		},
		{
			address: "0x4a4817F49F7f31a2c639C5C723D4BAA194AD0f77",
        	pk: "12cc2f60b68a8fefb85e93fed0a2ae4680a465f714e4ea42f4a73cf27f317257"
		}
	]

};


// list of accounts to use
config.accounts = new Array();

// first account = default account, coinbase
config.accounts[0] = new Object();
config.accounts[0].address = config.account;
config.accounts[0].pk = null;

// other accounts with their private key
config.accounts[1] = new Object();
config.accounts[1].address = "0x4a4817F49F7f31a2c639C5C723D4BAA194AD0f77";
config.accounts[1].pk = "12cc2f60b68a8fefb85e93fed0a2ae4680a465f714e4ea42f4a73cf27f317257";

module.exports = config;