# Online Marketplace

This is a sample project written in Solidity programming language. The project is e-commerce store running on the ethereum network.

# Installing
<ol>
  <li>Install nodejs (which includes npm).</li>
  <br>
  <li>Install Truffle Framework.<br><code>$ npm install -g truffle</code></li>
  <br>
  <li>Install Ganache CLI.<br><code>$ npm install -g ganache-cli</code></li>
  <br>
  <li>Clone this repository locally</li>
  <br>
  <li>Open console in the project folder and install all dependencies.<br><code>$ npm install</code></li>
  <br>
  <li>Start local blockchain <br><code>$ ganache-cli</code></li>
  <br>
  <li>Install Metamask extension in your browser.</li>
  <br>
  <li>Connect to the blockchain in Metamask with "Custom RPC" option and paste the url that ganache-cli listens. The host and port in truffle-config.js must match that url.</li>
  <br>
  <li>Copy the mnemonic that ganache-cli generates in the console and import account in Metamask</li>
  <br>
  <li>Migrate contracts <br><code>$ truffle migrate</code></li>
  <br>
  <li>Start dev server <br><code>$ npm run dev</code></li>
  <br>
  <li>The first account in metamask is the owner of the contract</li>
</ol>
