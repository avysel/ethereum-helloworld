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

contract Hello is owned {

    string private name;

	event NameChanged(string newName);

    constructor() public {
        name = "nobody";
    }

    function setName(string memory newName) public {
        name = newName;
        emit NameChanged(newName);
    }

    function getName() public view returns (string memory) {
        return name;
    }

}
