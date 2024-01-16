import { createServer } from 'http' 
//const { createServer } = require('node:http');
const { Server } = require('socket.io');
import { SimpleSocketManager } from './simple_socket_manager' ;

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
  socketManager.hail("Look out !!");
  socketManager.hail_anon("Look out again!!");
  socketManager.hail_async("Look out again, triped!!");
  socketManager.hail_many(["Step0", "Step1", "Step2", "Step3"]);
  socketManager.hail_many_async(["ASYNC Step0", "ASYNC Step1", "ASYNC Step2", "ASYNC Step3"]);
}, 11000);
//socketManager.discuss("titi");
//SocketManager.say_hello('toto');

function *fn() {
  for (let _ of [1,2,3]) {
    yield _;
  }
}

console.log(fn.constructor.name);
async function* foo() {
  yield await Promise.resolve('a');
  yield await Promise.resolve('b');
  yield await Promise.resolve('c');
}

console.dir(foo);