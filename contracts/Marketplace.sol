pragma solidity ^0.5.2;

import './Ownable.sol';
import './StoreFront.sol';

contract Marketplace is Ownable {
    mapping (address => bool) private admins;
    address[] private allAdmins;
    
    modifier onlyAdmin() {
        require(isAdmin(), "You are not admin.");
        _;
    }
    
    function isAdmin() public view returns(bool) {
        return admins[msg.sender] == true;
    }
    
    function addAdmin(address adminAddr) public onlyOwner {
        if(admins[adminAddr] == true) {
            revert("This address is admin already!");
        }

        allAdmins.push(adminAddr);
        admins[adminAddr] = true;
    }

    function getAdmins() public view onlyOwner returns(address[] memory) {
        return allAdmins;
    }
    
    struct Store {
        bool active;
        StoreFront store;
        string name;
        bytes32[] keys;
        mapping (bytes32 => Product) products;
    }
    
    struct Product {
        bool active;
        uint256 price;
        uint256 quantity;
    }
    
    struct StoreOwner {
        bool active;
        uint256 balance;
        bytes32[] keys;
    }
     
    bytes32[] private storeFrontsKeys;
    mapping (bytes32 => Store) private storeFronts;
    mapping (address => bool) private storeFrontsAddr;
     
    address[] private allStoreOwners;
    mapping (address => StoreOwner) private storeOwners;
    
    function addStoreOwner(address addr) public onlyAdmin {
        if(storeOwners[addr].active) {
            revert("This address is store owner already!");
        }
        
        allStoreOwners.push(addr);
        storeOwners[addr].active = true;
    }

    function getStoreOwners() public view onlyAdmin returns(address[] memory) {
        return allStoreOwners;
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

    function addStoreFront(string memory name) public onlyStoreOwner returns(address) {
        require(bytes(name).length != 0, "Store name is required.");
         
        bytes32 key = keccak256(abi.encodePacked(name, now));
        
        storeOwners[msg.sender].keys.push(key);
        storeFrontsKeys.push(key);

        StoreFront store = new StoreFront(key);
        
        Store memory storeFront;
        storeFront.active = true;
        storeFront.name = name;
        storeFront.store = store;
        storeFrontsAddr[address(store)] = true;

        storeFronts[key] = storeFront;
        
        return address(store);
    }
     
    function getStoreFrontsList() public view onlyStoreOwner returns (bytes32[] memory) {
        return storeOwners[msg.sender].keys;
    }
    
    function getStoreFrontName(bytes32 storeKey) public view returns (string memory) {
        isStoreFrontActive(storeKey);
        
        return storeFronts[storeKey].name;
    }

    function getStoreFrontProps(bytes32 key) public view onlyStoreOwner returns(string memory, address, uint256) {
        isStoreFrontActive(key);

        return (storeFronts[key].name,
                storeFronts[key].store.getAddress(key),
                storeFronts[key].store.getBalance(key));
    }
    
    function withdrawStoreFrontBalance(bytes32 key) public onlyStoreOwner {
        uint256 balance = storeFronts[key].store.withdraw(key);
        
        msg.sender.transfer(balance);
    }
     
    function validatePriceAndQuantity(uint256 price,uint256 quantity) private pure {
        require(price > 0 && quantity >= 1, "Price is required!");
    }
    
    function addProduct(bytes32 storeKey, uint256 price, uint256 quantity) public onlyStoreOwner {
        isStoreFrontActive(storeKey);
        validatePriceAndQuantity(price, quantity);
    
        bytes32 key = keccak256(abi.encodePacked(price, now));
        
        storeFronts[storeKey].keys.push(key);
    
        storeFronts[storeKey].products[key] = Product(true, price, quantity);
    }
    
    function editProduct(bytes32 storeKey, bytes32 productKey, uint256 price, uint256 quantity) public onlyStoreOwner  {
        isProductActive(storeKey, productKey);
        validatePriceAndQuantity(price, quantity);

        if(storeFronts[storeKey].products[productKey].price != price) {    
            storeFronts[storeKey].products[productKey].price = price;
        }

        if(storeFronts[storeKey].products[productKey].quantity != quantity) {
            storeFronts[storeKey].products[productKey].quantity = quantity;
        }
    }
    
    function getProduct(bytes32 storeKey, bytes32 productKey) public view returns(uint256, uint256) {
        isProductActive(storeKey, productKey);
        
        Product memory product = storeFronts[storeKey].products[productKey];

        return (product.price, product.quantity);
    }
    
    function getProductsList(bytes32 storeKey) public view returns(bytes32[] memory) {
        isStoreFrontActive(storeKey);
        
        return storeFronts[storeKey].keys;
    }
    
    function removeProduct(bytes32 storeKey, bytes32 productKey) public onlyStoreOwner returns(bytes32[] memory)  {
        isProductActive(storeKey, productKey);
            
        delete(storeFronts[storeKey].products[productKey]);
        
        for(uint256 i = 0; i < storeFronts[storeKey].keys.length; i++) {
            if(productKey == storeFronts[storeKey].keys[i]) {
                bytes32 key = storeFronts[storeKey].keys[storeFronts[storeKey].keys.length - 1];
                storeFronts[storeKey].keys[i] = key;
                delete key;
                storeFronts[storeKey].keys.length--;
                return storeFronts[storeKey].keys;
            }
        }
    }

    function isShopper() public view returns(bool) {
        require(msg.sender != owner(), "You are not shopper.");
        require(!isAdmin(), "You are not shopper.");
        require(!isStoreOwner(), "You are not shopper.");
        
        return true;
    }
     
    function shopperStoreFronts() public view returns (bytes32[] memory) {
        return storeFrontsKeys;
    }
    
    function buyProduct(bytes32 storeKey, bytes32 productKey, uint256 requestedQtity) public payable {
        (uint256 price, uint256 qtity) = getProduct(storeKey, productKey);
        
        require(msg.value >= price * requestedQtity);
        require(qtity >= requestedQtity);
        
        uint256 totalPrice = price * requestedQtity;
        
        storeFronts[storeKey].store.deposit(storeKey, totalPrice);
        
        storeFronts[storeKey].products[productKey].quantity -= requestedQtity;
        
        assert(storeFronts[storeKey].products[productKey].quantity + requestedQtity == qtity);
     }
}