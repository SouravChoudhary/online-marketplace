pragma solidity >=0.5.2 <0.5.7;

import './Ownable.sol';
import './StoreFront.sol';
import './SafeMath.sol';

/** @title Online Marketplace */
contract Marketplace is Ownable {

    using SafeMath for uint256;

    mapping (address => bool) private admins;
    address[] private allAdmins;

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

    
    bool isStopped = false;

    modifier stopInEmergency {
        require(!isStopped);
        _;
    }

    /** @dev owner stops contract when needed
     */
    function stopContract() public onlyOwner {
        isStopped = true;
    }

    /** @dev owner starts contract when needed
     */
    function resumeContract() public onlyOwner {
        isStopped = false;
    }
    
    modifier onlyAdmin() {
        require(isAdmin(), "You are not admin.");
        _;
    }

    modifier onlyStoreOwner() {
        require(isStoreOwner(), "You are not store owner.");
        _;
    }

    /** @dev Checks if address is set as admin
      * @return true if address is admin
      */
    function isAdmin() public view returns(bool) {
        return admins[msg.sender] == true;
    }
    
    /** @dev adds address as admin
      * @param adminAddr - admin address to be set as admin
      */
    function addAdmin(address adminAddr) public onlyOwner stopInEmergency {
        if(admins[adminAddr] == true) {
            revert("This address is admin already!");
        }

        allAdmins.push(adminAddr);
        admins[adminAddr] = true;
    }

    /** @dev gets the admins array
      * @return admins array
      */
    function getAdmins() public view onlyOwner returns(address[] memory) {
        return allAdmins;
    }
    
    /** @dev adds address as store owner
      * @param addr - address to be set as store owner
      */
    function addStoreOwner(address addr) public onlyAdmin stopInEmergency {
        if(storeOwners[addr].active) {
            revert("This address is store owner already!");
        }
        
        allStoreOwners.push(addr);
        storeOwners[addr].active = true;
    }

    /** @dev gets store owners array
      * @return store owners array
      */
    function getStoreOwners() public view onlyAdmin returns(address[] memory) {
        return allStoreOwners;
    }
     
    /** @dev checks if store front is active
      * @param storeKey - store front key
      */
    function isStoreFrontActive(bytes32 storeKey) private view {
        require(storeFronts[storeKey].active == true, "Store front doesn't exist.");
    }
     
    /** @dev checks if product is active
      * @param storeKey - store front key
      * @param productKey - product key
      */
    function isProductActive(bytes32 storeKey, bytes32 productKey) private view {
        require(storeFronts[storeKey].active == true, "Store front doesn't exist.");
        require(storeFronts[storeKey].products[productKey].active == true, "Product doesn't exist.");
    }
    
    /** @dev checks if store owner is active
      * @return true if store owner is active
      */
    function isStoreOwner() public view returns(bool) {
        return storeOwners[msg.sender].active == true;
    }

    /** @dev adds store front to store owner
      * @param name - store front name
      */
    function addStoreFront(string memory name) public onlyStoreOwner stopInEmergency {
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
    }
     
    /** @dev gets all store fronts keys for specific store owner
      * @return keys array
      */
    function getStoreFrontsList() public view onlyStoreOwner returns (bytes32[] memory) {
        return storeOwners[msg.sender].keys;
    }
    
    /** @dev gets store front name for specific store with key
      * @param storeKey - store front key
      * @return store front name
      */
    function getStoreFrontName(bytes32 storeKey) public view returns (string memory) {
        isStoreFrontActive(storeKey);
        
        return storeFronts[storeKey].name;
    }

    /** @dev gets store front properties with store front key: name, address, balance
      * @param key - store front key
      * @return store front name
      * @return store front address
      * @return store front balance
      */
    function getStoreFrontProps(bytes32 key) public view onlyStoreOwner returns(string memory, address, uint256) {
        isStoreFrontActive(key);

        return (storeFronts[key].name,
                storeFronts[key].store.getAddress(key),
                storeFronts[key].store.getBalance(key));
    }
    
    /** @dev withdraws balance from store front to the store owner only
      * @param key - store front key
      */
    function withdrawStoreFrontBalance(bytes32 key) public onlyStoreOwner stopInEmergency {
        uint256 balance = storeFronts[key].store.withdraw(key);
        
        msg.sender.transfer(balance);
    }
     
    /** @dev validates price and quantity when shopper buys products
      * @param price - product price
      * @param quantity - product quantity
      */
    function validatePriceAndQuantity(uint256 price,uint256 quantity) private pure {
        require(price > 0 && quantity >= 1, "Price is required!");
    }
    
    /** @dev adds product to store owner's store front
      * @param storeKey - store front key
      * @param price - product price
      * @param quantity - product quantity
      */
    function addProduct(bytes32 storeKey, uint256 price, uint256 quantity) public onlyStoreOwner stopInEmergency {
        isStoreFrontActive(storeKey);
        validatePriceAndQuantity(price, quantity);
    
        bytes32 key = keccak256(abi.encodePacked(price, now));
        
        storeFronts[storeKey].keys.push(key);
    
        storeFronts[storeKey].products[key] = Product(true, price, quantity);
    }
    
    /** @dev edits product in store owner's store front
      * @param storeKey - store front key
      * @param productKey - product key
      * @param price - product price
      * @param quantity - product quantity
      */
    function editProduct(bytes32 storeKey, bytes32 productKey, uint256 price, uint256 quantity) public onlyStoreOwner stopInEmergency  {
        isProductActive(storeKey, productKey);
        validatePriceAndQuantity(price, quantity);

        if(storeFronts[storeKey].products[productKey].price != price) {    
            storeFronts[storeKey].products[productKey].price = price;
        }

        if(storeFronts[storeKey].products[productKey].quantity != quantity) {
            storeFronts[storeKey].products[productKey].quantity = quantity;
        }
    }
    
    /** @dev gets product for store owner's store front
      * @param storeKey - store front key
      * @param productKey - product key
      * @return product price
      * @return product quantity
      */
    function getProduct(bytes32 storeKey, bytes32 productKey) public view returns(uint256, uint256) {
        isProductActive(storeKey, productKey);
        
        Product memory product = storeFronts[storeKey].products[productKey];

        return (product.price, product.quantity);
    }
    
    /** @dev gets products list for store owner's store front
      * @param storeKey - store front key
      * @return products keys array
      */
    function getProductsList(bytes32 storeKey) public view returns(bytes32[] memory) {
        isStoreFrontActive(storeKey);
        
        return storeFronts[storeKey].keys;
    }
    
    /** @dev removes product from store owner's store front
      * @param storeKey - store front key
      * @param productKey - product key
      */
    function removeProduct(bytes32 storeKey, bytes32 productKey) public onlyStoreOwner stopInEmergency {
        isProductActive(storeKey, productKey);
            
        delete(storeFronts[storeKey].products[productKey]);
        
        for(uint256 i = 0; i < storeFronts[storeKey].keys.length; i++) {
            if(productKey == storeFronts[storeKey].keys[i]) {
                bytes32 key = storeFronts[storeKey].keys[storeFronts[storeKey].keys.length - 1];
                storeFronts[storeKey].keys[i] = key;
                delete key;
                storeFronts[storeKey].keys.length = storeFronts[storeKey].keys.length.sub(1);
            }
        }
    }

    /** @dev checks if address user is shopper
      * @return true if address user is shopper
      */
    function isShopper() public view returns(bool) {
        require(msg.sender != owner(), "You are not shopper.");
        require(!isAdmin(), "You are not shopper.");
        require(!isStoreOwner(), "You are not shopper.");
        
        return true;
    }
     
    /** @dev gets all store fronts
      * @return store fronts keys array
      */
    function shopperStoreFronts() public view returns (bytes32[] memory) {
        return storeFrontsKeys;
    }
    
    /** @dev buys product for shopper
      * @param storeKey - store front key
      * @param productKey - product key
      * @param requestedQtity - product quantity to buy
      */
    function buyProduct(bytes32 storeKey, bytes32 productKey, uint256 requestedQtity) public payable stopInEmergency {
        (uint256 price, uint256 qtity) = getProduct(storeKey, productKey);
        
        uint256 totalPrice = price.mul(requestedQtity);

        require(msg.value >= totalPrice);
        require(qtity >= requestedQtity);
        
        storeFronts[storeKey].store.deposit(storeKey, totalPrice);
        
        storeFronts[storeKey].products[productKey].quantity = storeFronts[storeKey].products[productKey].quantity.sub(requestedQtity);

        assert(storeFronts[storeKey].products[productKey].quantity.add(requestedQtity) == qtity);
     }
}