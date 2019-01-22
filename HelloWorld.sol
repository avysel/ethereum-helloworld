pragma solidity ^0.5.0;

contract Hello {

    string private name;

    constructor() public {
        name = "nobody";
    }

    function set(string memory newName) public {
        name = newName;
    }

    function hello() public view returns (string memory) {
        return name;
    }

}
