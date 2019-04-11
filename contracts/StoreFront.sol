pragma solidity ^0.5.2;

contract StoreFront {
    uint256 private balance;
    bytes32 private key;
    
    constructor(bytes32 _key) public {
        key = _key;
    }
    
    modifier requestKey(bytes32 _key) {
        require(key == _key);
        _;
    }

    function getBalance(bytes32 _key) public view requestKey(_key) returns(uint256) {
        return balance;
    }

    function getAddress(bytes32 _key) public view requestKey(_key) returns(address) {
        return address(this);
    }

    function withdraw(bytes32 _key) public requestKey(_key) returns(uint256) {
        uint256 amount = balance;
        balance = 0;
        
        return amount;
    }
    
    function deposit(bytes32 _key, uint256 amount) public payable requestKey(_key) {
        balance += amount;
    }
}