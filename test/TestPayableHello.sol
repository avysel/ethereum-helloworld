pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PayableHello.sol";

contract TestPayableHello {

  function testInitialPayableHello() public {
    PayableHello payableHello = PayableHello(DeployedAddresses.PayableHello());

    string memory expected = "nobody";

    Assert.equal(payableHello.getName(), expected, "name wasn't nobody");
  }

}