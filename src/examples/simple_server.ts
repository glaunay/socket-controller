import { createServer } from 'http' 
//const { createServer } = require('node:http');
const { Server } = require('socket.io');
import { SocketManager } from '../index' ;

const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: 'Hello Justin Chéri!',
    }));
  });
  
  server.listen(8000);


const io = new Server(server);

SocketManager.attach(io);