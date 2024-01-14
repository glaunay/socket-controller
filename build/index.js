"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
//const { createServer } = require('node:http');
//const { Server } = require('socket.io');
const server = (0, http_1.createServer)((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        data: 'Hello Justin Chéri!',
    }));
});
server.listen(8000);
