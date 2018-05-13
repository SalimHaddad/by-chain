const Websocket = require('ws');

const P2P_PORT  = process.env.P2P_PORT || 5001; //giving the user the ability to overried the port 5001 with an enviroment variable
const peers     = process.env.PEERS ? process.env.PEERS.split(',') : []; // check if peers is present

//HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://5001, ws://5002 npm run dev

class P2pServer{

  constructor(blockchain)
  {
    this.blockchain = blockchain ;
    this.sockets = [];
  }

  listen() // starts up the server and creates it
  {
    const server = new Websocket.Server({port:P2P_PORT});
    server.on('connection', socket => this.connectSocket(socket) ); //listens for incoming types of messages

    this.connectToPeers();

    console.log(`Listening for peer-to-peer conections on: ${P2P_PORT}`);
  }

  connectToPeers()// for 2nd, 3rd or a later instance of the blockchain app
  {
    peers.forEach(peer => {
//ws://localhost/5001
const socket = new Websocket(peer);

socket.on('open', () => this.connectSocket(socket));
    });
  }



  connectSocket(socket)//pushing the socket to the array of sockets
  {
    this.sockets.push(socket);
    console.log('Socket connected');

    this.messageHandler(socket);
    this.sendChain(socket);

  }

  messageHandler(socket){
    socket.on('message', message => {
      const data = JSON.parse(message);

      this.blockchain.replaceChain(data);

    });

  }

  sendChain(socket)
  {
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  syncChains() // sync all of the chains
  {
    this.sockets.forEach(socket => this.sendChain(socket));


}
}

module.exports = P2pServer;
