const PayableHello = artifacts.require("PayableHello");
const TestPayableHello = artifacts.require("TestPayableHello");

module.exports = function(deployer) {
  	deployer.deploy(PayableHello);
    deployer.deploy(TestPayableHello);
};
