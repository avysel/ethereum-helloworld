const Hello = artifacts.require("Hello");

contract("Hello", async accounts => {
  it("should display 'nobody' when no name set", async () => {
		let hello = await Hello.deployed();
		let name = await hello.getName.call();
		assert.equal(name, "nobody","name wasn't nobody");
    });

  it("should change the name and display the new name", async () => {
    let newName = "toto";
	let hello = await Hello.deployed();
	let gas = await hello.setName.estimateGas(newName, { from: accounts[0], gas: 4000000 }	);
	let txHash = await hello.setName.sendTransaction(newName, { from: accounts[0], gas: gas });
	let name = await hello.getName.call();
	assert.equal(name, newName,"name wasn't changed" );
  });

  it("should not be the name it's not", async () => {
    let newName = "toto";
    let wrongName = "titi";
	let hello = await Hello.deployed();
	let gas = await hello.setName.estimateGas(newName, { from: accounts[0], gas: 4000000 }	);
	let txHash = await hello.setName.sendTransaction(newName, { from: accounts[0], gas: gas });
	let name = await hello.getName.call();
	assert.notEqual(name, wrongName,"hum, seems to be always true even when false :(" );
  });

});