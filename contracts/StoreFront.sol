pragma solidity ^0.5.2;

contract StoreFront {
    uint256 private balance;
    address payable private owner;

    constructor(address payable _owner) public {
        owner = _owner;
    } 

    modifier onlyStoreOwner() {
        require(msg.sender == owner, "You are not this store's owner");
        _;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function getAddress() public view returns(address) {
        return address(this);
    }

    function withdraw() public onlyStoreOwner {
        owner.transfer(address(this).balance);
    }
    
    function() external payable {
        balance += msg.value;
    }
}