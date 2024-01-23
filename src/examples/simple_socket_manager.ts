import { SocketController, ListenTo } from '../index';


export class ssmOne extends SocketController {

    @ListenTo()
    discuss_logic_one(data: string, socket:any) {
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_logic_one\' reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_logic_one\' returns \"${msg}\"`);
        return msg;
    }

    @ListenTo()
    discuss_common_logic(data: string, socket:any) {
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_common_logic\' reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_common_logic\' returns \"${msg}\"`);
      //  console.log(`ssm${this.id} emiting \"${msg}\" over [discuss_common_logic]`);
        return msg;
    }
}



export class ssmTwo extends SocketController {  
    
    @ListenTo()
    discuss_logic_two(data: string, socket:any) {
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_logic_two\' reveives \"${data}\"`);
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_logic_two\' returns \"${msg}\"`);
        return msg;
    }

    @ListenTo('reply_other_topic')
    discuss_common_logic(data: string, socket:any) {
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_common_logic\' reveives \"${data}\"`);      
        const msg = `The server [${this.id}] is answering to you!`;
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_common_logic\' returns \"${msg}\" over \"reply_other_topic\"`);
        return msg;
    }
}