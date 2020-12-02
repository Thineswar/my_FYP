var smart_contract = artifacts.require("certificate");

module.exports = function(deployer) {
    deployer.deploy(smart_contract);
};
