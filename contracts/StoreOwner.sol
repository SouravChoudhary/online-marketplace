pragma solidity ^0.5.2;

import "./StoreFront.sol";

contract StoreOwner {
    address private addr;
    uint private balance;
    StoreFront[] private storeFronts;
    
    function setAddress(address _addr) public payable {
        addr = _addr;
    }
    
    function getAddress() public view returns(address) {
        return addr;
    }

    function getBalance() public view returns(uint) {
        return balance;
    }
    
    function addStoreFront(StoreFront storeFront) public payable {
        storeFronts.push(storeFront);
    }
    
    function getStoreFronts() public view returns(StoreFront[] memory) {
        return storeFronts;
    }
}