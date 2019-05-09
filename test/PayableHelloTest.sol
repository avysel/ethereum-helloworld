import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PayableHello.sol";

contract TestPayableHello {

  function testInitialPayableHello() {
    PayableHello payableHello = PayableHello(DeployedAddresses.PayableHello());

    string expected = "nobody";

    Assert.equal(payableHello.getName(), expected, "name wasn't nobody");
  }

}