import { Listen, Answer, AnswerMany, SocketManager, Server, ListenTo } from '../index';

export class SimpleSocketManager extends SocketManager {
    constructor(socketServer: Server) {
        super(socketServer);
    }
    @Listen
    say_hello(data: string) {
        console.log(`[SUCCESS] SocketManager:say_hello receives \"${data}\"`);
        return "Bonjour"
    }

    @Listen
    say_hello2(data: string) {
        console.log(`[SUCCESS] SocketManager:say_hello2 receives \"${data}\"`);
        return "Bonjour"
    }

    @Listen
    say_hello3(data: string) {
        console.log(`[SUCCESS] SocketManager:say_hello3 receives \"${data}\"`);
        if (data === "panic input")
            throw new Error("say hello3 runtime error");
        return "Bonjour"
    }

    // Only emit case
    @Answer('server_cast')
    hail(msg: string) {
        console.log("Starting hail");
        //const msg="The server is hailing you!";
        console.log(`I emiting \"${msg}\" over [server_cast]`);
        return msg;
    }

    // Only emit case
    @Answer()
    hail_anon(msg: string) {
        console.log("Starting hail");
        console.log(`I emiting \"${msg}\" over [hail_anon]`);
        return msg;
    }

       // Only emit case
    @Answer()
    async hail_async(msg: string) {
           console.log("Starting hail_async");
           await Promise.resolve('');
           console.log(`I emiting \"${msg}\" over [hail_async]`);
           return msg;
    }

    @AnswerMany()
    *hail_many(msgs: string[]) {
        console.log("Starting hail_many");
        for (let t of msgs.map( ( msg, i)=> [`msg_${i}`, msg]) )           
            yield(t)        
            
    }
    @AnswerMany()
    async *hail_many_async(msgs: string[]) {
        console.log("Starting hail_many_async");
        for (let t of msgs.map( ( msg, i)=> [`async_msg_${i}`, msg] ) )
            yield await Promise.resolve(t);
           
    }

    // emit triggered by succesfull listen
    //@Answer('server_reply')
    @ListenTo()
    discuss(data: string) {
        console.log(`[SUCCESS] SocketManager:discuss reveives \"${data}\"`);
        const msg = "The server is answering to you!";
        console.log(`I emiting \"${msg}\" over [discuss]`);
        return msg;
    }
}