import React, { Component } from 'react';
import keythereum from 'keythereum';
import QRCode from 'react-qr';
import QrReader from 'react-qr-reader';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel, Alert } from 'react-bootstrap';
import BigNumber from 'bignumber.js'

import BrownieCoinModel from './BrownieCoinModel'

class Wallet extends Component {
  constructor(props) {
    super(props);

    BigNumber.config({ DECIMAL_PLACES: 2 })

    var value = window.localStorage.getItem('erc20set2w_keyvault');
    var prKey = value ? JSON.parse(value) : undefined;

    this.state = {
      publicKey: prKey ? keythereum.privateKeyToAddress(Buffer.from(prKey.privateKey.data)) : '',
      privateKey: prKey,
      balance: new BigNumber(0),
      symbol: '',
      isTransferring: false,
      transferTo: '',
      transferAmount: 0,
      transferError: '',
      showQRCode: false,
      showTransfer: false,
      showScan: false,
      scanLoading: true,
      legacyMode: false
    };

    this.generate = this.generate.bind(this);
    this.transfer = this.transfer.bind(this);
    this.handleScan = this.handleScan.bind(this);
    this.handleError = this.handleError.bind(this);
    this.openImageDialog = this.openImageDialog.bind(this);
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
      this.state.transferAmount <= 0) {
      this.setState({
        transferError: 'Recipient address or amount is not provided'
      });
      return;
    }

    const amount = this.state.transferAmount * 100;

    if (this.state.balance.lt(new BigNumber(amount))) {
      this.setState({
        transferError: 'Not enough balance'
      });
      return;
    }

    this.setState({
      transferError: '',
      isTransferring: true
    })

    const privateKey = Buffer.from(this.state.privateKey.privateKey.data).toString('hex');
    BrownieCoinModel
      .transfer(this.state.transferTo, amount, privateKey,
      {
        from: this.state.publicKey,
        gas: 60000,
        gasPrice: 50000000000
      })
      .then(x => this.setState({
        balance: this.state.balance.sub(amount),
        showTransfer: false,
        isTransferring: false,
        transferAmount: 0,
        transferTo: '',
        transferError: ''
      }))
      .catch(x => this.setState({
        transferError: x.toString(),
        isTransferring: false
      }));
  }

  handleScan(data) {
    if (!data) {
      return
    }

    var transferTo = '';
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
    this.setState({
      legacyMode: true
    })
  }

  openImageDialog() {
    this.refs.reader.openImageDialog()
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
    let closeTransfer = () => this.setState({
      showTransfer: false,
      transferAmount: 0,
      transferTo: '',
      transferError: ''
    });
    let closeScan = () => this.setState({ showScan: false });

    return (
      <div>
        {!this.state.publicKey ?
          <div>
            <Button onClick={this.generate}>Generate Address</Button>
          </div> :
          <div>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ display: 'inline' }}>Your address: {this.state.publicKey}</h3>
              <div
                onClick={() => this.setState({ showQRCode: true })}
                style={{
                  width: 26,
                  height: 26,
                  cursor: 'pointer',
                  float: 'right',
                  marginLeft: 12,
                  backgroundImage: 'url(./images/qr.svg)',
                  backgroundSize: '26px 26px'
                }}></div>
            </div>
            <h3>Your balance: {this.getFormattedBalance()} {this.state.symbol}</h3>
            <Modal
              show={this.state.showQRCode}
              onHide={closeQRCode}
              container={this}
              bsSize='sm'
              aria-labelledby='contained-modal-title'
            >
              <Modal.Header closeButton>
                <Modal.Title id='contained-modal-title'>QR code</Modal.Title>
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
              aria-labelledby='contained-modal-title'
            >
              <Modal.Header closeButton>
                <Modal.Title id='contained-modal-title'>Transfer</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.state.transferError ? <Alert bsStyle='danger'>{this.state.transferError}</Alert> : null}
                <Form>
                  <FormGroup widths='equal'>
                    <ControlLabel style={{ color: '#333' }}>To (0xac60E10c4f29c4B8D7Ce5D3F01Ee4Cd631447CD0)</ControlLabel>
                    <FormControl type='text'
                      placeholder='Recipient address'
                      value={this.state.transferTo}
                      onChange={(e) => this.setState({ transferTo: e.target.value })} />
                    <ControlLabel style={{ color: '#333' }}>Amount</ControlLabel>
                    <FormControl type='text'
                      placeholder='Amount'
                      value={this.state.transferAmount}
                      onChange={(e) => this.setState({ transferAmount: e.target.value })} />
                  </FormGroup>
                  <FormGroup>
                    <div
                      onClick={() => this.setState({ showScan: true })}
                      style={{
                        width: 50,
                        height: 50,
                        cursor: 'pointer',
                        float: 'left',
                        marginRight: 18,
                        backgroundImage: 'url(./images/scan-qr.svg)',
                        backgroundSize: '50px 50px'
                      }}></div>
                    <Button
                      disabled={this.state.isTransferring}
                      onClick={!this.state.isTransferring ? this.transfer : null}>
                      {this.state.isTransferring ? 'Transferring...' : 'Transfer'}
                    </Button>
                    <Modal
                      show={this.state.showScan}
                      onHide={closeScan}
                      container={this}
                      aria-labelledby='contained-modal-title'
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id='contained-modal-title'>Scan</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {this.state.legacyMode ? <Button onClick={this.openImageDialog}>Submit QR Code</Button> : null}
                        <QrReader
                          ref='reader'
                          style={previewStyle}
                          onError={this.handleError}
                          onScan={this.handleScan}
                          legacyMode={this.state.legacyMode}
                        />
                      </Modal.Body>
                    </Modal>
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