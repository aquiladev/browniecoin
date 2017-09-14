import { BrownieCoin } from './Contracts'

class BrownieCoinModel {
  static contractAddress = "0xab905cb5ee18fa0d704ae734c50371ebe6d60b71";

  static async getBalance(address) {
    let coin = BrownieCoin.at(this.contractAddress);
    return await coin.balanceOf(address);
  }

  static async getSymbol() {
    let coin = BrownieCoin.at(this. contractAddress);
    return await coin.symbol();
  }
}

export default BrownieCoinModel;