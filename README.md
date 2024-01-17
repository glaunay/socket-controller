# socket-controller, an all around Socket IO Backend Controller

This package is a drop-in backend-end controller solution for socket-io managed websocket.
Controller logics are regrouped inside single class, derived from a SocketController abstract class. Each class will run as singleton and several different class can operate at the same runtime. The incoming packets are passed to the corresponding SocketManager controller through the namespace Socket.IO feature. By default, namespace equals to the class name, eg: the class MyController will listen to '/MyController'.

## controller methods logic
The decorator `@ListenTo`, will decorate a Controller method to bind its logic to  socket.io incoming/outgoing events. It will Make the decorated function receiving data from the websocket on event with the same name as the decorated function, eg: myMethod will be triggered by 'myMethod' incoming event
The return value of the decorated function will be emited back to ws client on an event of similar name. This return event can be renamed by providing an optional string to the decorator. eg: \@ListenTo('resultEvent'). 

## Installation

##### client-side : `npm install socket.io-client`
##### server-side : `npm install socket-controller`

## Deployment

### Server-side
The method is passed a direct reference to the underlying socket object if several emits are required.
Methods can be async.
```js
import { SocketController, Server, ListenTo } from 'socket-controller';


export class MySocketCtrl extends SocketController {
    @ListenTo()
    welcome(data: string) {
        const msg = `The server MySocketCtrl is answering to you!`;
        return msg;
    }

    @ListenTo('reply_here')
    say_hello(data: string, socket:any) {      
        const msg = `The server MySocketCtrl is answering to you too!`;
        return msg;
    }
}
```

### Client-side
You just need to account for the namespace at connection
```js
// cross origin version
const socket = io("https://server-domain.com/admin");
socket.on("connect", () =>{ 
    socket.emit("welcome", `Hi from Client`);
    socket.emit("say_hello", `Hi from Client too`);
});
socket.on("welcome",(data) => console.log(data)) # prints "The server MySocketCtrl is answering to you!"
socket.on("reply_here",(data) => console.log(data)) # prints "The server MySocketCtrl is answering to you too!"
```

