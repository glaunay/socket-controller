"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
//const { createServer } = require('node:http');
const { Server } = require('socket.io');
const index_1 = require("../index");
const server = (0, http_1.createServer)((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        data: 'Hello Justin Chéri!',
    }));
});
server.listen(8000);
const io = new Server(server);
index_1.SocketManager.attach(io);
index_1.SocketManager.say_hello('toto');
