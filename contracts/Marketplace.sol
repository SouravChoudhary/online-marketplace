pragma solidity ^0.5.2;

import 'node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './StoreOwner.sol';

contract Marketplace is Ownable {
    address[] private adminsArr;
    mapping (address => bool) private admins;
    StoreOwner[] private storeOwners;
    
    modifier onlyAdmin() {
        require(admins[msg.sender] == true);
        _;
    }
    
    modifier onlyStoreOwner() {
        bool exists = false;
        
        for(uint i = 0; i < storeOwners.length; i++){
            if(storeOwners[i].getAddress() == msg.sender){
                exists = true;
                break;
            }    
        }
        
        require(exists);
        _;
    }
    
    function addAdmin(address adminAddr) public payable onlyOwner {
        if(admins[adminAddr] == false) {
            admins[adminAddr] = true;
            adminsArr.push(adminAddr);
        } else {
            revert("This address is admin already!");
        }
    }

    function removeAdmin(address adminAddr) public payable onlyOwner {
        for(uint i = 0; i < adminsArr.length; i++) {
            if(adminsArr[i] == adminAddr) {
                delete adminsArr[i];
                admins[adminAddr] = false;
                break;
            }
        }
    }

    function getAdmins() public view onlyOwner returns(address[] memory) {
        return adminsArr;
    }

     function isAdmin() public view onlyOwner returns (bool) {
        for(uint i = 0; i < adminsArr.length; i++) {
            if(adminsArr[i] == msg.sender) {
                return true;
            }
        }

        return false;
    }
    
    function addStoreOwner(address storeOwnerAddr) public onlyAdmin {
        for(uint i = 0; i < storeOwners.length; i++){
            if(storeOwners[i].getAddress() == storeOwnerAddr){
                revert("This address is store owner already!");
            }    
        }

        StoreOwner newStoreOwner = new StoreOwner();
        newStoreOwner.setAddress(storeOwnerAddr);
        storeOwners.push(newStoreOwner);
    }
    
    function getStoreOwners() public view onlyAdmin returns(StoreOwner[] memory) {
        return storeOwners;
    }
    
    function addStoreFront(address storeOwnerAddr) public payable onlyStoreOwner {
        for(uint i = 0; i < storeOwners.length; i++) {
            if(storeOwners[i].getAddress() == storeOwnerAddr) {
                storeOwners[i].addStoreFront(new StoreFront());
            }
        }
    }
    
    function getStoreFronts(address storeOwnerAddr) public view onlyStoreOwner returns(StoreFront[] memory) {
        for(uint i = 0; i < storeOwners.length; i++) {
            if(storeOwners[i].getAddress() == storeOwnerAddr) {
                return storeOwners[i].getStoreFronts();
            }
        }
    }
    
    function addProduct(
        uint storeFrontId,
        string memory title, 
        string memory description, 
        uint price
    ) public payable onlyStoreOwner {
        require(abi.encodePacked(title).length > 0, "Product title is required!");
        require(price > 0, "Price is required!");
        
        StoreFront[] memory storeFronts;
        storeFronts = getStoreFronts(msg.sender);
        
        validate(storeFronts.length, storeFrontId, "Store front doesn't exist for this shop owner!");
                
        for(uint i = 0; i < storeFronts.length; i++) {
            if(i == storeFrontId) {
                storeFronts[i].addProduct(title, description, price);
            }
        }
    }
    
    function getProduct(uint storeFrontId, uint productId) public view onlyStoreOwner returns (string memory, string memory, uint) {
        StoreFront[] memory storeFronts;
        storeFronts = getStoreFronts(msg.sender);
        
        validate(storeFronts.length, storeFrontId, "Store front doesn't exist for this shop owner!");
        
        for(uint i = 0; i < storeFronts.length; i++) {
            validate(storeFronts[i].getProductsLength(), productId, "Product doesn't exist for this shop owner's store front!");
            
            if(i == storeFrontId) {
                return storeFronts[i].getProduct(productId);    
            }
        }
    }
    
    function validate(uint itemsLength, uint index, string memory message) private view onlyStoreOwner {
        if(itemsLength - 1 < index || index < 0 || itemsLength == 0) {
            revert(message);    
        }   
    }
}