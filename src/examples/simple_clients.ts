import { io } from "socket.io-client";


const pullDelay = () => Math.floor(Math.random() * 10);
/* Dummy client, creatin a new socket each time
*/
const any_client = (id:string) => {
    const delay = pullDelay();
    console.log(`Client ${id} is connecting in ${delay}sc`);
    const _ = setTimeout( ()=> {
        const socket = io("http://localhost:8000");
        
        socket.on("connect", () =>{ 
            const evt = 'say_hello';
            console.log(`Client ${id} CONNECTED => emiting on ${evt}`);
            socket.emit(evt, `Hi from Client ${id}`);
            setTimeout( ()=> {
                const evt = 'say_hello2';
                console.log(`Client ${id} emiting on ${evt}`);
                socket.emit(evt, `More talks from Client ${id}`);
            },  delay * 1000);
            setTimeout( ()=> {
                const evt = 'say_hello3';
                console.log(`Client ${id} emiting on ${evt}`);
                socket.emit(evt, "panic input");
            },  delay * 1000);

        });
        socket.on("server_cast", (m:string) => {
            console.log("[server_cast] Client receives " + m);
        });
    }, delay * 1000);
};

any_client('1');



