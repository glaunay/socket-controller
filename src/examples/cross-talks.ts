import { io } from "socket.io-client";

console.log("\t####Testing cross-talks####");
const pullDelay = () => Math.floor(Math.random() * 10);

/**  Dummy client "constructor", simulating concurrent socket/server 
*/
export const any_client = (id:string, type:string) => {
    //const short=id.substring(0,4);
    const delay = pullDelay();
    console.log(`Client ${id} is connecting in ${delay}sc`);
    const _ = setTimeout( ()=> {
        const socket = io(`http://localhost:8000/${id}`);
        
        socket.on("connect", () =>{ 
            const short=socket.id?.substring(0,4);
            id = id.substring(0,4);
            console.log(`\nClient ${id} ${type} :: Connected as socket ${short}!`);             
            
            console.log(`Client ${short} emiting on \"discuss_${type}\"`);
            socket.emit(`discuss_${type}`, `Let's start discuss under discuss_${type}?`);
            
            console.log(`Client ${short} emiting on \"discuss_common_logic\"`);
            socket.emit(`discuss_common_logic`, `Let's start discuss under common_logic (from client[${type}])?`);

        //...
        socket.on(`discuss_${type}`, (m: string) => {
            console.log(`[discuss_${type}:${short}] Client${type} receives \"${m}\"`);
        });
        socket.on(`discuss_common_logic`, (m: string) => {
            console.log(`[discuss_common_logic:${short}] Client${type} receives \"${m}\"`);
        });
        socket.on(`discuss_${type}`, (m: string) => {
            console.log(`[discuss_${type}:${short}] Client${type} receives \"${m}\"`);
        });
        socket.on(`reply_other_topic`, (m: string) => {
            console.log(`[reply_other_topic:${short}] Client${type} receives \"${m}\"`);
        });
        });
        
            

    }, delay * 1000);
};


any_client('ssmOne', 'logic_one');
any_client('ssmTwo', 'logic_two');
//any_client(uuidv4(), 'logic_one');



