pragma solidity ^0.5.2;

contract StoreFront {
    uint private balance;

    function getBalance() public view returns(uint256) {
        return balance;
    }
}