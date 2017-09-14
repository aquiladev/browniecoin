import React, { Component } from 'react';
import keythereum from 'keythereum';
import QRCode from 'react-qr';
import QrReader from 'react-qr-reader';
import { Button, Modal, Form, Icon } from 'semantic-ui-react';
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
      symbol: ""
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
            <Modal size='mini' trigger={<Button icon size='huge'><Icon name='qrcode' /></Button>} closeIcon>
              <Modal.Header>QR code</Modal.Header>
              <Modal.Content>
                <Modal.Description style={{ textAlign: 'center' }}>
                  <QRCode text={this.state.publicKey} />
                </Modal.Description>
              </Modal.Content>
            </Modal>
            <Modal trigger={<Button size='huge'>Transfer</Button>} closeIcon>
              <Modal.Header>Transfer</Modal.Header>
              <Modal.Content>
                <Modal.Description>
                  <Form>
                    <Form.Group widths='equal'>
                      <Form.Input label='To' placeholder='address' />
                      <Form.Input label='Amount' placeholder='amount' />
                    </Form.Group>
                    <Form.Group>
                      <Modal size='tiny' trigger={<Button>Scan</Button>} closeIcon>
                        <Modal.Header>Scan</Modal.Header>
                        <Modal.Content>
                          <Modal.Description>
                            <QrReader
                              style={previewStyle}
                              onError={this.handleError}
                              onScan={this.handleScan}
                            />
                            <p>{this.state.result}</p>
                          </Modal.Description>
                        </Modal.Content>
                      </Modal>
                      <Form.Button>Transfer</Form.Button>
                    </Form.Group>
                  </Form>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </div>}
      </div>
    );
  }
}

export default Wallet;