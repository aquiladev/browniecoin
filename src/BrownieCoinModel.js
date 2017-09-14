import { BrownieCoin, web3Provided } from './Contracts'

class BrownieCoinModel {
  static contractAddress = "0xab905cb5ee18fa0d704ae734c50371ebe6d60b71";

  static async addAccount(privateKey) {
    web3Provided.eth.accounts.privateKeyToAccount(privateKey);
  }

  static async getBalance(address) {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.balanceOf(address);
  }

  static async getSymbol() {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.symbol();
  }

  static async transfer(address, amount, options) {
    let coin = BrownieCoin.at(this.contractAddress);
    console.log(web3Provided.accounts.wallet)
    // return await coin.methods.transfer(address, amount, options);
  }
}

export default BrownieCoinModel;