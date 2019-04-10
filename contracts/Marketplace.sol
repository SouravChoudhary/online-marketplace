pragma solidity ^0.5.2;

import './Ownable.sol';
import './StoreFront.sol';

contract Marketplace is Ownable {
    mapping (address => bool) private admins;
    
    modifier onlyAdmin() {
        require(isAdmin(), "You are not admin.");
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
        bytes32[] keys;
        mapping (bytes32 => Product) products;
    }
    
    struct Product {
        bool active;
        uint256 price;
    }
    
    struct StoreOwner {
        bool active;
        uint256 balance;
        bytes32[] keys;
    }
     
    bytes32[] private storeFrontsKeys;
    mapping (bytes32 => Store) private storeFronts;
     
    address[] private allStoreOwners;
    mapping (address => StoreOwner) private storeOwners;
    
    function addStoreOwner(address addr) public payable onlyAdmin {
        if(storeOwners[addr].active) {
        revert("This address is store owner already!");
        }
        
        allStoreOwners.push(addr);
    
        storeOwners[addr].active = true;
    }
    
    modifier onlyStoreOwner() {
        require(isStoreOwner(), "You are not store owner.");
        _;
    }
     
    function isStoreFrontActive(bytes32 storeKey) private view {
        require(storeFronts[storeKey].active == true, "Store front doesn't exist.");
    }
     
    function isProductActive(bytes32 storeKey, bytes32 productKey) private view {
        require(storeFronts[storeKey].active == true, "Store front doesn't exist.");
        require(storeFronts[storeKey].products[productKey].active == true, "Product doesn't exist.");
    }
    
    function isStoreOwner() public view returns(bool) {
        return storeOwners[msg.sender].active == true;
    }
    
    function addStoreFront(string memory name) public payable onlyStoreOwner returns(address) {
        require(bytes(name).length != 0, "Store name is required.");
         
        StoreFront addr = new StoreFront(msg.sender);
        
        Store memory storeFront;
        storeFront.active = true;
        storeFront.name = name;
        storeFront.addr = addr;
        
        bytes32 key = keccak256(abi.encodePacked(name, now));
        
        storeOwners[msg.sender].keys.push(key);
        storeFrontsKeys.push(key);
        storeFronts[key] = storeFront;
        
        return address(addr);
    }
     
    function getStoreFrontsList() public view onlyStoreOwner returns (bytes32[] memory) {
        return storeOwners[msg.sender].keys;
    }
    
    function getStoreFront(bytes32 storeKey) public view onlyStoreOwner returns (StoreFront, string memory) {
        isStoreFrontActive(storeKey);
         
        return (storeFronts[storeKey].addr, storeFronts[storeKey].name);
    }
     
    function validatePrice(uint256 price) private pure {
        require(price > 0, "Price is required!");
    }
    
    function addProduct(bytes32 storeKey, uint256 price) public payable onlyStoreOwner {
        isStoreFrontActive(storeKey);
        validatePrice(price);
    
        bytes32 key = keccak256(abi.encodePacked(price, now));
        
        storeFronts[storeKey].keys.push(key);
    
        storeFronts[storeKey].products[key] = Product(true, price);
    }
    
    function editProduct(
        bytes32 storeKey, 
        bytes32 productKey, 
        uint256 price
        ) public payable 
        onlyStoreOwner  {
        isProductActive(storeKey, productKey);
        validatePrice(price);
            
        storeFronts[storeKey].products[productKey].price = price;
    }
    
    function getProduct(bytes32 storeKey, bytes32 productKey) public view returns(uint256) {
        isProductActive(storeKey, productKey);
        
        return storeFronts[storeKey].products[productKey].price;
    }
    
    function getProductsList(bytes32 storeKey) public view onlyStoreOwner returns(bytes32[] memory) {
        isStoreFrontActive(storeKey);
        
        return storeFronts[storeKey].keys;
    }
    
    function removeProduct(bytes32 storeKey, bytes32 productKey) public payable 
        onlyStoreOwner returns(bytes32[] memory)  {
        isProductActive(storeKey, productKey);
            
        delete(storeFronts[storeKey].products[productKey]);
        
        for(uint i = 0; i < storeFronts[storeKey].keys.length; i++) {
            if(productKey == storeFronts[storeKey].keys[i]) {
                bytes32 key = storeFronts[storeKey].keys[storeFronts[storeKey].keys.length - 1];
                storeFronts[storeKey].keys[i] = key;
                delete key;
                storeFronts[storeKey].keys.length--;
                return storeFronts[storeKey].keys;
            }
        }
    }
}