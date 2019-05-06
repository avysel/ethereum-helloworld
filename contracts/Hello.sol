pragma solidity ^0.5.0;

contract Hello {

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