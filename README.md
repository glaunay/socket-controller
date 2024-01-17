# socket-controller-rdy, an all around Socket IO Backend Controller

This package is a drop-in backend-end controller solution for socket-io managed websocket.
Controller logics are regrouped inside single class, derived from a SocketController abstract class. Each class will run as singleton and several different class can operate at the same runtime. The incoming packets are passed to the corresponding SocketManager controller through the namespace Socket.IO feature. By default, namespace equals to the class name, eg: the class MyController will listen to '/MyController'.

## controller methods logic
The decorator `@ListenTo`, will decorate a Controller method to bind its logic to  socket.io incoming/outgoing events. The decorated function will receive data from the websocket on event with the same name as the decorated function, eg: myMethod will be triggered by 'myMethod' incoming event
The return value of the decorated function will be emited back to ws client on an event of similar name. This return event can be renamed by providing an optional string to the decorator. eg: \@ListenTo('resultEvent'). 

## Installation

##### client-side : `npm install socket.io-client`
##### server-side : `npm install socket-controller`

## Deployment

### Server-side
The method is passed as a trailer argument a direct reference to the underlying socket object if several emits are required.
Methods can be async.
```js
import { SocketController, ListenTo, Socket } from 'socket-controller';


export class MySocketCtrl extends SocketController {
    @ListenTo()
    welcome(data: string) {
        const msg = `The WS controller MySocketCtrl is answering to you!`;
        return msg;
    }

    @ListenTo('reply_here')
    say_hello(data: string, socket:Socket) {
        socket.emit("updateEvent", "step one passed")
        const msg = `The WS controller MySocketCtrl is answering to you too!`;
        return msg;
    }
}

// Create a dummy http server attaching the socket.io instance.
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});
// Instantiate the controller passing
// an already existing socket.io server instance
const socketManagerTwo = new MySocketCtrl({socketServer:io});
```

### Client-side
You just need to account for the namespace at connection.

```js
const socket = io("https://server-domain.com/MySocketCtrl");
socket.on("connect", () =>{ 
    socket.emit("welcome", `Hi from Client`);
    socket.emit("say_hello", `Hi from Client too`);
});
socket.on("welcome",(data) => console.log(data)) // prints "The WS controller MySocketCtrl is answering to you!"
socket.on("reply_here",(data) => console.log(data)) // prints "The WS controller MySocketCtrl is answering to you too!"
```

