import Web3 from 'web3'
import SignerProvider from 'ethjs-provider-signer'
import { sign } from 'ethjs-signer';

import { BrownieCoin, web3Provided } from './Contracts'

class BrownieCoinModel {
  static contractAddress = '0xab905cb5ee18fa0d704ae734c50371ebe6d60b71';

  static async getBalance(address) {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.balanceOf(address);
  }

  static async getSymbol() {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.symbol();
  }

  static async transfer(address, amount, privateKey, options) {
    const web3Location = 'https://ropsten.infura.io/RavKyxI3bw0DM1k0dd4o'
    const provider = new SignerProvider(web3Location, {
      signTransaction: (rawTx, cb) => cb(null, sign(rawTx, "0x" + privateKey)),
      accounts: (cb) => cb(null, [options.from])
    });
    let web3 = new Web3(provider);
    BrownieCoin.setProvider(web3.currentProvider);

    // var web3q = new Web3(new Web3.providers.HttpProvider(web3Location))
    // // var block = web3q.eth.getBlock("latest");
    // // console.log("gasLimit: " + block.gasLimit);
    // var gasPrice = web3q.eth.gasPrice;
    // console.log(gasPrice.toString(10));

    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.transfer(address, amount, options);
  }
}

export default BrownieCoinModel;