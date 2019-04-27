var config = {};

config.nodeURL = "http://127.0.0.1";
config.nodePort = 7545;

config.account = "0xdB4524A58c78f0945338fe7fF7c3E5988d413032";
config.abiFile = "../build/contracts/PayableHello.json";
config.payableHelloContractAddress = "0xA559eDe868A7f8235f530f2F76DD95Cbea7a6406";

config.accounts = new Array();

config.accounts[0] = new Object();
config.accounts[0].address = config.account;
config.accounts[0].pk = null;

config.accounts[1] = new Object();
config.accounts[1].address = "0x4a4817F49F7f31a2c639C5C723D4BAA194AD0f77";
config.accounts[1].pk = "12cc2f60b68a8fefb85e93fed0a2ae4680a465f714e4ea42f4a73cf27f317257";

module.exports = config;