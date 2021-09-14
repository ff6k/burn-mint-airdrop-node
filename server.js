const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const fs = require("fs");
const contractJson = fs.readFileSync('./abi.json');
const Web3WsProvider = require('web3-providers-ws');
const HDWalletProvider = require("truffle-hdwallet-provider");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//initial web3
const abi = JSON.parse(contractJson);
const connectionProvider = new Web3WsProvider(`wss://kovan.infura.io/ws/v3/${process.env.infuraProjectID}`);
const zeroExPrivateKeys = [process.env.walletPrivateKey];

const walletProvider = new HDWalletProvider(zeroExPrivateKeys, connectionProvider);
const web3 = new Web3(walletProvider);

//initial contract
const contract = new web3.eth.Contract(abi, process.env.contractAddress);

app.route('/mint').post(async (req, res) => {
    const { toAddress, amount } = req.body;
    const [account] = await web3.eth.getAccounts();

    contract.methods.mint(toAddress, amount).estimateGas({ from: account })
        .then(gasAmount => {
            contract.methods.mint(toAddress, amount)
                .send({
                    from: account,
                    gasLimit: gasAmount,
                    type: '0x2'
                })
                .then(result => {
                    res.send(result)
                })
                .catch(error => {
                    res.status(404).send(error)
                })
        })
        .catch(err => {
            res.status(404).send(err)
        })
});

app.route('/burn').post(async (req, res) => {
    const { amount } = req.body;
    const [account] = await web3.eth.getAccounts();
    contract.methods.burn(amount).estimateGas({ from: account })
        .then(gasAmount => {
            contract.methods.burn(amount)
                .send({
                    from: account,
                    gasLimit: gasAmount,
                    type: '0x2'
                })
                .then(result => {
                    res.send(result)
                })
                .catch(error => {
                    res.status(404).send(error)
                })
        })
        .catch(err => {
            res.status(404).send(err)
        })
})

app.route('/airdrop').post(async (req, res) => {
    const { recipient, amount } = req.body;
    const [account] = await web3.eth.getAccounts();

    contract.methods.getAirdrop(recipient, amount).estimateGas({ from: account })
        .then(gasAmount => {
            contract.methods.getAirdrop(recipient, amount)
                .send({
                    from: account,
                    gasLimit: gasAmount,
                    type: '0x2'
                })
                .then(result => {
                    res.send(result)
                })
                .catch(error => {
                    res.status(404).send(error)
                })
        })
        .catch(err => {
            res.status(404).send(err)
        })
});

app.listen(port, () => console.log(`API server running on port ${port}`));