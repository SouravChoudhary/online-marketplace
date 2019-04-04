const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:8545");

const contractJson = JSON.parse(fs.readFileSync('build/contracts/Marketplace.json', 'utf8'));
const contract = new web3.eth.Contract(contractJson.abi, contractJson.networks['5777'].address);