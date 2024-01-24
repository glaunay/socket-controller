import { io } from "socket.io-client";


const pullDelay = () => Math.floor(Math.random() * 10);
/* Dummy client, creatin a new socket each time
*/
const any_client = (id:string) => {
    const delay = pullDelay();
    console.log(`Client ${id} is connecting in ${delay}sc`);
    const _ = setTimeout( ()=> {
        const socket = io("http://localhost:8000/ssmTwo");
        console.log(socket);
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
        socket.on("hail_anon", (m:string) => {
            console.log("[hail_anon] Client receives " + m);
        });
        socket.on("hail_async", (m:string) => {
            console.log("[hail_async] Client receives " + m);
        });
        socket.on("async_msg_0", (m:string) => {
            console.log("[async_msg_0] Client receives " + m);
        });
        socket.on("async_msg_1", (m:string) => {
            console.log("[async_msg_1] Client receives " + m);
        });
        socket.on("async_msg_2", (m:string) => {
            console.log("[async_msg_2] Client receives " + m);
        });
        socket.on("async_msg_3", (m:string) => {
            console.log("[async_msg_3] Client receives " + m);
        });

        socket.on("msg_0", (m:string) => {
            console.log("[msg_0] Client receives " + m);
        });
        socket.on("msg_1", (m:string) => {
            console.log("[msg_1] Client receives " + m);
        });
        socket.on("msg_2", (m:string) => {
            console.log("[msg_2] Client receives " + m);
        });
        socket.on("msg_3", (m:string) => {
            console.log("[msg_3] Client receives " + m);
        });
        socket.on("discuss", (m:string) => {
            console.log(`[discuss] Client receives \"${m}\"`);
        });
     
        
        setTimeout ( ()=>{console.log(`Client ${id} emiting on \"discuss\"`); socket.emit("discuss", "Let's start discuss")}, 2000);        
      
        
    }, delay * 1000);
};

any_client('1');



