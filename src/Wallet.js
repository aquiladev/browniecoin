import React, { Component } from 'react';
import keythereum from 'keythereum';
import QRCode from 'react-qr';
import QrReader from 'react-qr-reader';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Alert } from 'react-bootstrap';
import BigNumber from 'bignumber.js'

import { web3Provided } from './Contracts'
import BrownieCoinModel from './BrownieCoinModel'

class Wallet extends Component {
  constructor(props) {
    super(props);

    BigNumber.config({ DECIMAL_PLACES: 2 })

    var value = window.localStorage.getItem('erc20set2w_keyvault');
    var prKey = value ? JSON.parse(value) : undefined;

    // var key = Buffer.from(prKey.privateKey.data).toString("hex");
    // BrownieCoinModel.addAccount(key);

    this.state = {
      loading: false,
      publicKey: prKey ? keythereum.privateKeyToAddress(Buffer.from(prKey.privateKey.data)) : "",
      privateKey: prKey,
      balance: new BigNumber(0),
      symbol: "",
      transferTo: "0xbf35c1709efa89c4c694139d6c6de912b0ca30c2",
      transferAmount: 1,
      transferError: "",
      showQRCode: false,
      showTransfer: false,
      showScan: false
    };

    this.generate = this.generate.bind(this);
    this.transfer = this.transfer.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {
    if (!this.state.publicKey) {
      return;
    }

    Promise.all([
      BrownieCoinModel.getBalance(this.state.publicKey),
      BrownieCoinModel.getSymbol()])
      .then(x => {
        this.setState({
          balance: x[0],
          symbol: x[1]
        });
      })
  }

  generate() {
    var dk = keythereum.create();
    var pubKey = keythereum.privateKeyToAddress(dk.privateKey);
    window.localStorage.setItem('erc20set2w_keyvault', JSON.stringify(dk));
    this.setState({ publicKey: pubKey });
    return pubKey;
  }

  transfer() {
    if (!this.state.transferTo ||
      this.state.transferAmount === 0) {
      this.setState({
        transferError: "Recipient address or amount is not provided"
      });
      return;
    }

    BrownieCoinModel
      .transfer(this.state.transferTo, 1, { from: "0x1a31786A953BD0663aABF41383D8270f2A7Ab587" })
      .then(x => console.log(x));
    console.log(this.state);
  }

  handleScan(data) {
    if (!data) {
      return
    }

    var transferTo = "";
    var transferAmount = 0;
    try {
      var model = JSON.parse(data);
      transferTo = model.to;
      transferAmount = model.amount;
    } catch (err) {
      transferTo = data;
    }

    this.setState({
      transferTo: transferTo,
      transferAmount: transferAmount,
      showScan: !data
    });
  }

  handleError(err) {
    console.error(err)
  }

  getFormattedBalance() {
    return this.state.balance.div(100).toString();
  }

  render() {
    const previewStyle = {
      height: 340,
      width: '100%',
    }
    let closeQRCode = () => this.setState({ showQRCode: false });
    let closeTransfer = () => this.setState({ showTransfer: false });
    let closeScan = () => this.setState({ showScan: false });

    return (
      <div>
        {!this.state.publicKey ?
          <div>
            <Button onClick={this.generate}>Generate Address</Button>
          </div> :
          <div>
            <h3>Your address: {this.state.publicKey}</h3>
            <h3>Your balance: {this.getFormattedBalance()} {this.state.symbol}</h3>
            <img src="./images/qr.png"
              onClick={() => this.setState({ showQRCode: true })}
              style={{ width: 46, cursor: "pointer", display: "inline", marginRight: 20 }}></img>
            <Modal
              show={this.state.showQRCode}
              onHide={closeQRCode}
              container={this}
              aria-labelledby="contained-modal-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title">QR code: {this.state.publicKey}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <QRCode text={this.state.publicKey} />
              </Modal.Body>
            </Modal>
            <Button onClick={() => this.setState({ showTransfer: true })}>
              Transfer
            </Button>
            <Modal
              show={this.state.showTransfer}
              onHide={closeTransfer}
              container={this}
              aria-labelledby="contained-modal-title"
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title">Transfer</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.state.transferError ? <Alert bsStyle="danger"><h4>{this.state.transferError}</h4></Alert> : null}
                <Form>
                  <FormGroup widths='equal'>
                    <ControlLabel>To</ControlLabel>
                    <FormControl type='text'
                      placeholder='Recipient address'
                      value={this.state.transferTo}
                      onChange={(e) => this.setState({ transferTo: e.target.value })} />
                    <ControlLabel>Amount</ControlLabel>
                    <FormControl type='text'
                      placeholder='Amount'
                      value={this.state.transferAmount}
                      onChange={(e) => this.setState({ transferAmount: e.target.value })} />
                  </FormGroup>
                  <FormGroup>
                    <Button onClick={() => this.setState({ showScan: true })}>
                      Scan
                    </Button>
                    <Modal
                      show={this.state.showScan}
                      onHide={closeScan}
                      container={this}
                      aria-labelledby="contained-modal-title"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title">Scan</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <QrReader
                          delay={100}
                          style={previewStyle}
                          onError={this.handleError}
                          onScan={this.handleScan}
                        />
                        <p>{this.state.result}</p>
                      </Modal.Body>
                    </Modal>
                    <Button onClick={this.transfer}>Transfer</Button>
                  </FormGroup>
                </Form>
              </Modal.Body>
            </Modal>
          </div>}
      </div>
    );
  }
}

export default Wallet;