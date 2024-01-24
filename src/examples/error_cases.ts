import { io } from "socket.io-client";
import { inspect } from 'util';

console.log("\t####Testing error handlings####");
const pullDelay = () => Math.floor(Math.random() * 10);

/**  Dummy client "constructor", simulating concurrent socket/server 
*/

setTimeout ( () => {
    const socket = io(`http://localhost:8000/ErrorService`);
    socket.on("connect", () =>{ 
        const short=socket.id?.substring(0,4);
        console.log(`\nClient socket [${short}] connected!`);
        socket.emit('nobodyThere', 'Are you there?');
        socket.on('nobodyThere', (...d)=> console.log("this should no be printed " + d))

        socket.emit('clunckyService', 'TicTac');
        socket.on('clunckyService', (...d)=> console.log( "this should contain an error:\n" + inspect(d) ));

    });

}, pullDelay())



