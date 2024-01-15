import { createServer } from 'http' 
//const { createServer } = require('node:http');
const { Server } = require('socket.io');
import { SimpleSocketManager } from '../index' ;

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: 'Hello Justin Chéri!',
    }));
  });
  



const io = new Server(server);

const socketManager = new SimpleSocketManager(io);


server.listen(8000);
setTimeout( ()=> {
  console.log("The server wants to discuss");
  socketManager.hail("Look out !!")
}, 11000);
//socketManager.discuss("titi");
//SocketManager.say_hello('toto');