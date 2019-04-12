const PayingHello = artifacts.require("PayingHello");

module.exports = function(deployer) {
  deployer.deploy(PayingHello);
};
