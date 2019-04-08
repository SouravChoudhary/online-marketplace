pragma solidity ^0.5.2;

import './Ownable.sol';
import './StoreFront.sol';

contract Marketplace is Ownable {
    mapping (address => bool) private admins;
    
    modifier onlyAdmin() {
        require(isAdmin());
        _;
    }

    function isAdmin() public view returns(bool) {
        return admins[msg.sender] == true;
    }

    function addAdmin(address adminAddr) public payable onlyOwner {
        if(admins[adminAddr] == true) {
            revert("This address is admin already!");
        }
        
        admins[adminAddr] = true;
    }

    struct Store {
        bool active;
        StoreFront addr;
        string name;
        uint256 count;
        mapping (uint256 => Product) products;
    }
    
    struct Product {
        bool active;
        uint256 price;
    }

    struct StoreOwner {
        bool active;
        uint256 balance;
        uint256 count;
        mapping (uint256 => Store) storeFronts;
    }

    mapping (address => StoreOwner) private storeOwners;
    
    function addStoreOwner(address addr) public payable onlyAdmin {
        if(storeOwners[addr].active) {
            revert("This address is store owner already!");
        }
        
        storeOwners[addr].active = true;
    }

    modifier onlyStoreOwner() {
        require(isStoreOwner());
        _;
    }

    function isStoreOwner() public view returns(bool) {
        return storeOwners[msg.sender].active == true;
    }
    
    function addStoreFront(string memory name) public payable onlyStoreOwner {
        uint256 index = storeOwners[msg.sender].count++;

        StoreFront addr = new StoreFront();

        Store memory storeFront;
        storeFront.active = true;
        storeFront.name = name;
        storeFront.addr = addr;

        storeOwners[msg.sender].storeFronts[index] = storeFront;
    }

    modifier storeFrontActive(uint256 key) {
        require(storeOwners[msg.sender].storeFronts[key].active == true);
        _;
    }

    function getStoreFrontsCount() public view onlyStoreOwner returns (uint256) {
        return storeOwners[msg.sender].count;
    }

    function getStoreFront(uint256 key) public view onlyStoreOwner storeFrontActive(key) returns (string memory) {
        return storeOwners[msg.sender].storeFronts[key].name;
    }
    
    function addProduct(uint256 key, uint256 price) public payable onlyStoreOwner storeFrontActive(key) {
        require(price > 0, "Price is required!");

        uint256 index = storeOwners[msg.sender].storeFronts[key].count++;

        storeOwners[msg.sender].storeFronts[key].products[index] = Product(true, price);
    }

    function editProduct(
        uint256 storeKey, 
        uint256 productKey, 
        uint price) public payable 
        onlyStoreOwner 
        storeFrontActive(storeKey) {
        storeOwners[msg.sender].storeFronts[storeKey].products[productKey].price = price;
    }

    function getProduct(
        uint256 storeKey, 
        uint256 productKey) public view 
        onlyStoreOwner 
        storeFrontActive(storeKey) returns(uint256) {
        return storeOwners[msg.sender].storeFronts[storeKey].products[productKey].price;
    }

    function getProductsCount(uint256 storeKey) public view onlyStoreOwner storeFrontActive(storeKey) returns(uint256) {
        return storeOwners[msg.sender].storeFronts[storeKey].count;
    }

    function removeProduct(
        uint256 storeKey, 
        uint256 productKey) public payable 
        onlyStoreOwner 
        storeFrontActive(storeKey) {
        delete(storeOwners[msg.sender].storeFronts[storeKey].products[productKey]);
        storeOwners[msg.sender].storeFronts[storeKey].count--;
    }
}