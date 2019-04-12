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
	event Withdraw(address ownerAddress, uint balance);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public payable {
    	require(msg.value >= 2 ether, "Pay 2 ETH or more");
        name = newName;
        emit NameChanged(newName);
        emit PaymentReceipt(msg.sender, msg.value);
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function withdraw() public onlyOwner {
    	uint balance = address(this).balance;
		msg.sender.transfer(balance);
		emit Withdraw(msg.sender, balance);
    }

    function() external payable {
        revert();
    }

}