import Web3 from 'web3'
import contract from 'truffle-contract'

import BrownieCoinJSON from './contracts/BrownieCoin.json'

const BrownieCoin = contract(BrownieCoinJSON);

const web3Location = 'https://ropsten.infura.io/RavKyxI3bw0DM1k0dd4o';

var web3Provided
// Supports Metamask and Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
  // Use the Mist/wallet provider.
  // eslint-disable-next-line
  web3Provided = new Web3(web3.currentProvider)
} else {
  web3Provided = new Web3(new Web3.providers.HttpProvider(web3Location))
}

BrownieCoin.setProvider(web3Provided.currentProvider)

const accounts = web3Provided.eth.accounts;
export { BrownieCoin, accounts }