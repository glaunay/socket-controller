import { SocketController, ListenTo, SocketControllerRegister } from '../controllers';


@SocketControllerRegister
export class ssmOne extends SocketController {
    
    @ListenTo()
    discuss_logic_one(word1: string, word2:string, socket:any) {
        console.log(`[Controler] SocketManager[${this.id} / ${socket.id}]:\'discuss_logic_one\' reveives \"${word1}\" \"${word2}\"`);
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



@SocketControllerRegister
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



@SocketControllerRegister
export class ErrorService extends SocketController {
    
    @ListenTo()
    nobodyThere(data:string){
        // Oups, I don't expec to return anything
    }

    @ListenTo()
    nobodyThereToo(data:string){
       return undefined;
    }

    @ListenTo()
    clunckyService() {
        throw new Error("I'am broken")
    }
}