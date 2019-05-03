const Hello = artifacts.require("PayableHello");

// truncate an ether number to keep only significant numbers and avoid js rounding problems
function t(n) {
	return Math.trunc(n/100000000000);
}

contract("PayableHello", async accounts => {
  it("should display 'nobody' when no name set", async () => {
		let hello = await Hello.deployed();
		let name = await hello.getName.call();
		assert.equal(name, "nobody","name wasn't nobody");
   });

  it("should pay to change the name and display the new name", async () => {
    let newName = "toto";
    let price = "2";
	let hello = await Hello.deployed();
	let gas = await hello.setName.estimateGas(newName, { from: accounts[0], gas: 4000000, value: web3.utils.toWei(price, "ether") }	);
	let txHash = await hello.setName.sendTransaction(newName, { from: accounts[0], gas: gas, value: web3.utils.toWei(price, "ether") });
	let name = await hello.getName.call();
	assert.equal(name, newName,"name wasn't changed" );
  });

  it("should not change the name because don't pay enough", async () => {
    let newName = "titi";
    let price = "1";
	let hello = await Hello.deployed();
	let oldName = await hello.getName.call();
	let name = null;

	try {
		let gas = await hello.setName.estimateGas(newName, { from: accounts[0], gas: 4000000, value: web3.utils.toWei(price, "ether") }	);
		let txHash = await hello.setName.sendTransaction(newName, { from: accounts[0], gas: gas, value: web3.utils.toWei(price, "ether") });
	}
	catch(error) {}

	name = await hello.getName.call();
	assert.equal(name, oldName,"name was changed" );
	assert.notEqual(name, newName,"name was changed" );
  });


  it("should withdraw contract balance", async () => {
		let hello = await Hello.deployed();
		let initialContractBalance = await web3.eth.getBalance(hello.address);
		let initialUserBalance = await web3.eth.getBalance(accounts[0]);

		let gas = await hello.withdraw.estimateGas({ from: accounts[0], gas: 4000000 }	);
        let receipt = await hello.withdraw.sendTransaction( { from: accounts[0], gas: gas*2 });

		let gasUsed = receipt.receipt.gasUsed;
		let tx = await web3.eth.getTransaction(receipt.tx);
		let gasPrice = tx.gasPrice;
		let txPrice = (gasPrice * gasUsed);

		let finalContractBalance = await web3.eth.getBalance(hello.address);
		let finalUserBalance = await web3.eth.getBalance(accounts[0]);

		assert.equal(finalContractBalance, 0,"contract balance is not 0");
		assert.equal(t(finalUserBalance), t(parseInt(initialContractBalance,10) + parseInt(initialUserBalance,10) - parseInt(txPrice,10)) ,"user balance is not initial balance + contract balance - tx price");
  });

  it("should not withdraw contract balance", async () => {
		let hello = await Hello.deployed();
		let initialContractBalance = await web3.eth.getBalance(hello.address);
		let initialUserBalance = await web3.eth.getBalance(accounts[1]);

		try {
			var gas = await hello.withdraw.estimateGas({ from: accounts[1], gas: 4000000 }	);
			var receipt = await hello.withdraw.sendTransaction( { from: accounts[1], gas: gas*2 });
			let gasUsed = receipt.receipt.gasUsed;
			let tx = await web3.eth.getTransaction(receipt.tx);
			let gasPrice = tx.gasPrice;
			let txPrice = (gasPrice * gasUsed);
			assert.equal(1,2,"exception should have been thrown !");
		}
		catch(error) {
			assert.equal(1,1,"we should get a catch !");
		}

		let finalContractBalance = await web3.eth.getBalance(hello.address);
		let finalUserBalance = await web3.eth.getBalance(accounts[1]);

		assert.equal(finalContractBalance, initialContractBalance,"contract balance is not unchanged");
  });

});