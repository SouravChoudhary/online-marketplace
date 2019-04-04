const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:8545");

const contractAddress = '0xBd6fa0ad25062AB1e46f79b4Dbb23d7936D09c78';
const contractABI = JSON.parse(fs.readFileSync('build/contracts/Marketplace.json', 'utf8'));
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);