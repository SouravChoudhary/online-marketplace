//const Web3 = require('web3');

const ethers = require('ethers');

const fs = require('fs');

let url = 'http://127.0.0.1:8545';
//const web3 = new Web3(Web3.givenProvider || url);

const contractJson = JSON.parse(fs.readFileSync('build/contracts/Marketplace.json', 'utf8'));
const address = contractJson.networks['5777'].address;
const abi = contractJson.abi;

//const contract = new web3.eth.Contract(abi, address);
let provider = new ethers.providers.JsonRpcProvider(url);

module.exports = provider;