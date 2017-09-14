import React, { Component } from 'react';
import keythereum from 'keythereum';
import QRCode from 'react-qr';
import QrReader from 'react-qr-reader';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import BigNumber from 'bignumber.js'

import BrownieCoinModel from './BrownieCoinModel'

class Wallet extends Component {
  constructor(props) {
    super(props);

    BigNumber.config({ DECIMAL_PLACES: 2 })

    var value = window.localStorage.getItem('erc20set2w_keyvault');
    var prKey = value ? JSON.parse(value) : undefined;

    console.log(prKey)
    this.state = {
      loading: false,
      publicKey: prKey ? keythereum.privateKeyToAddress(Buffer.from(prKey.privateKey.data)) : "",
      privateKey: prKey,
      balance: new BigNumber(0),
      symbol: "",
      showQRCode: false,
      showTransfer: false,
      showScan: false
    };

    this.generate = this.generate.bind(this);
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

  handleScan(data) {
    this.setState({
      result: data,
    })
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
        <p>{this.state.fingerprint}</p>
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
                <Form>
                  <FormGroup widths='equal'>
                    <ControlLabel>To</ControlLabel>
                    <FormControl type='text' placeholder='address' />
                    <ControlLabel>Amount</ControlLabel>
                    <FormControl type='text' placeholder='amount' />
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
                          style={previewStyle}
                          onError={this.handleError}
                          onScan={this.handleScan}
                        />
                        <p>{this.state.result}</p>
                      </Modal.Body>
                    </Modal>
                    <Button>Transfer</Button>
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