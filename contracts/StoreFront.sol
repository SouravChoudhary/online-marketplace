pragma solidity ^0.5.2;

contract StoreFront {
    uint private balance;
    address private owner;

    constructor(address _owner) public {
        owner = _owner;
    } 

    modifier onlyStoreOwner() {
        require(msg.sender == owner, "You are not this store's owner");
        _;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }
}