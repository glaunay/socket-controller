import { createServer } from 'http' 
//const { createServer } = require('node:http');
const { Server } = require('socket.io');
import { ssmOne, ssmTwo } from './simple_socket_manager' ;

const server = createServer((req, res) => {
  /*  res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: 'Hello Justin Chéri!',
    }));
  */});
  
const io = new Server(server);

const socketManagerTwo = new ssmTwo({socketServer:io});
const socketManagerOne = new ssmOne({socketServer:io});


server.listen(8000);
