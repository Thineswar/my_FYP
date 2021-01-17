const smartContract = artifacts.require('Certificate');

contract('smartContract', function(){
	it("should fail to verify test file", function(){
		return smartContract.deployed().then(async function(instance){ //instance = instance of deployed smart contract
			return await instance.verify('0x1ed826ab69366cbdb4e24153aae56a84388e8cb5b4696aa7d7e85c5439a0f3db');
		}).then(function(resultObj){
			assert.equal(resultObj[1], 0, "Error! File is valid"); //file is valid if resultObj is not null
		});
	});

	it("should upload test file", function(){
		return smartContract.deployed().then(function(instance){
			instance.upload.call('0x1ed826ab69366cbdb4e24153aae56a84388e8cb5b4696aa7d7e85c5439a0f3db');
		});
	});

	it("should successfully verify previously uploaded test file", function(){
		return smartContract.deployed().then(async function(instance){
			return await instance.verify('0x1ed826ab69366cbdb4e24153aae56a84388e8cb5b4696aa7d7e85c5439a0f3db');
		}).then(function(resultObj){
			assert.notEqual(resultObj, null, "File is invalid"); 
		});
	});
});