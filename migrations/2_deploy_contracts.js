const Marketplace = artifacts.require("Marketplace");
const StoreOwner = artifacts.require("StoreOwner");
const StoreFront = artifacts.require("StoreFront");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
  deployer.deploy(StoreOwner);
  deployer.deploy(StoreFront);
};
