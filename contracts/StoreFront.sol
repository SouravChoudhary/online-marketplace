pragma solidity ^0.5.2;

contract StoreFront {
    string private storeName;
    struct Product {
        string title;
        string description;
        uint price;
    }
    Product[] private products;

    function setName(string memory _storeName) public payable {
        storeName = _storeName;
    }

    function getName() public view returns(string memory) {
        return storeName;
    }
    
    function addProduct(string memory title, string memory description, uint price) public payable {
        products.push(Product(title, description, price));
    }
    
    function getProductsLength() public view returns(uint){
        return products.length;
    }
    
    function getProduct(uint productId) public view returns(string memory, string memory, uint){
        return (products[productId].title, products[productId].description, products[productId].price);
    }
}