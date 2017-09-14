import Web3 from 'web3'
import SignerProvider from 'ethjs-provider-signer'
import { sign } from 'ethjs-signer';

import { BrownieCoin } from './Contracts'

class BrownieCoinModel {
  static contractAddress = '0xab905cb5ee18fa0d704ae734c50371ebe6d60b71';

  // static async addAccount(privateKey) {
  //   web3Provided.eth.accounts.privateKeyToAccount(privateKey);
  // }

  static async getBalance(address) {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.balanceOf(address);
  }

  static async getSymbol() {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.symbol();
  }

  static async transfer(address, amount, privateKey, publicKey, options) {
    const provider = new SignerProvider('https://ropsten.infura.io/RavKyxI3bw0DM1k0dd4o', {
      signTransaction: (rawTx, cb) => {
        console.log("sss")
        cb(null, sign(rawTx, "0x" + privateKey))
      },
      accounts: (cb) => {
        console.log("qqq")
        cb(null, [options.from])
      }
    });
    let web3 = new Web3(provider)
    BrownieCoin.setProvider(web3.currentProvider)

    let coin = BrownieCoin.at(this.contractAddress);

    // coin.transfer.call(address, amount, options).then(x => console.log(x))

    return await coin.transfer(address, amount, options);
  }
}

export default BrownieCoinModel;