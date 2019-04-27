var config = {};

// blockchain node IPC IP and port
config.nodeURL = "http://127.0.0.1";
config.nodePort = 7545;

// default account address
config.account = "0xdB4524A58c78f0945338fe7fF7c3E5988d413032";

// ABI file of smart contract
config.abiFile = "../build/contracts/PayableHello.json";

// address of deployed contract on blockchain
config.payableHelloContractAddress = "0xA559eDe868A7f8235f530f2F76DD95Cbea7a6406";

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