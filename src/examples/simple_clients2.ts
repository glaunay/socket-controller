import { io } from "socket.io-client";


const pullDelay = () => Math.floor(Math.random() * 10);
/* Dummy client, creatin a new socket each time
*/
const any_client = (id:string) => {
    const delay = pullDelay();
    console.log(`Client ${id} is connecting in ${delay}sc`);
    const _ = setTimeout( ()=> {
        const socket = io("http://localhost:8000");
        socket.on("discuss", (m:string) => {
            console.log(`[discuss] Client receives \"${m}\"`);
        });    
        socket.on("connect", () =>{ 
           
                
            console.log(`Client ${id} emiting on \"discuss\"`); 
            socket.emit("discuss", "Let's start discuss ?");
        });

    }, delay * 1000);
};

any_client('1');



