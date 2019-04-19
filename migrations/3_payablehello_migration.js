const PayableHello = artifacts.require("PayableHello");

module.exports = function(deployer) {
  deployer.deploy(PayableHello);
};
