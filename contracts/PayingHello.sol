pragma solidity ^0.5.0;

contract owned {
	address payable owner;

	// Contract constructor: set owner
	constructor() public {
		owner = msg.sender;
	}

	// Access control modifier
	modifier onlyOwner {
	    require(msg.sender == owner, "Only the contract owner can call this function");
	    _;
	}

	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}

}

contract PayingHello is owned {

    string private name;

	event NameChanged(string newName);
	event PaymentReceipt(address userAddress, uint value);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	if(msg.value < 1)
    		return;
        name = newName;
        emit NameChanged(newName);
        emit PaymentReceipt(msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getEthers() public onlyOwner {
		msg.sender.transfer(this.balance);
    }

    function() external payable {
        revert();
    }

}
