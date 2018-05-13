const express    = require('express');
const bodyParser = require('body-parser'); // module that helps us change format to json
const Blockchain = require('../blockchain');
const P2pServer  = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

const HTTP_PORT = process.env.HTTP_PORT || 3001; //IF MULTIPLE USERS ARE USING THE SAME HTTP_PORT

const app       = express();
const bc        = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);

app.use(bodyParser.json()); // allows us to receive Json in post requests

app.get('/blocks', (req, res) =>{  // returns the blocks so the user can view what has been stored

  res.json(bc.chain);


});
app.post('/mine', (req, res)=> { //users will use when they want to add data to the blockchain
const block = bc.addBlock(req.body.data);
console.log(`New block added: ${block.toString()}`); // users can see their new block after they just added it with POST

p2pServer.syncChains();

res.redirect('/blocks');

});
app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
  const { recipient, amount} = req.body;
  const transaction = wallet.createTransaction(recipient, amount, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
  res.json({publicKey: wallet.publicKey});
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();
