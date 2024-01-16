import { Listen, SocketManager, Server, ListenTo, SocketError } from '../index';


export class ssmOne extends SocketManager {

    constructor(socketServer: Server, id?:string) {
        console.log(`Creating socket manager \"${id}\"`);
        super({ socketServer, id });
    }
    @ListenTo()
    discuss_logic_one(data: string) {
        console.log(`[SUCCESS] SocketManager[${this.id}]:discuss_logic_one reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`ssm${this.id} emiting \"${msg}\" over [discuss_logic_one]`);
        return msg;
    }

    @ListenTo()
    discuss_common_logic(data: string) {
        console.log(`[SUCCESS] SocketManager[${this.id}]:\'discuss_common_logic\' reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`ssm${this.id} emiting \"${msg}\" over [discuss_common_logic]`);
        return msg;
    }
}



export class ssmTwo extends SocketManager {

    constructor(socketServer: Server, id?:string) {
        console.log(`Creating socket manager \"${id}\"`);
        super({ socketServer, id });
    }
  
    @ListenTo()
    discuss_logic_two(data: string) {
        console.log(`[SUCCESS] SocketManager[${this.id}]:discuss_logic_two reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`ssm${this.id} emiting \"${msg}\" over [discuss_logic_two]`);
        return msg;
    }

    @ListenTo('reply_other_topic')
    discuss_common_logic(data: string) {
        console.log(`[SUCCESS] SocketManager[${this.id}]:discuss_common_logic reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`ssm${this.id} emiting \"${msg}\" over [discuss_common_logic]`);
        return msg;
    }
}