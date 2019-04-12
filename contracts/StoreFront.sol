pragma solidity >=0.5.2 <0.5.7;

/** @title store front for store owner */
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

    /** @dev gets store front balance
      * @param _key - store front key
      * @return store front balance
      */
    function getBalance(bytes32 _key) public view requestKey(_key) returns(uint256) {
        return balance;
    }

    /** @dev gets store front address
      * @param _key - store front key
      * @return store front address
      */
    function getAddress(bytes32 _key) public view requestKey(_key) returns(address) {
        return address(this);
    }

    /** @dev withdraws store front balance to store front's store owner
      * @param _key - store front key
      * @return store front balance
      */
    function withdraw(bytes32 _key) public requestKey(_key) returns(uint256) {
        uint256 amount = balance;
        balance = 0;
        
        return amount;
    }
    
    /** @dev deposits amount to store front's balance when products are bought from the store front
      * @param _key - store front key
      * @param amount - total products price
      */
    function deposit(bytes32 _key, uint256 amount) public payable requestKey(_key) {
        balance += amount;
    }
}