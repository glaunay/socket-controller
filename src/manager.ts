import { Server as SocketIoServer } from 'socket.io'
import { v4 as uuid4 } from 'uuid';
import { Server as HttpServer } from 'http';
import { SocketController , SocketControllerParameters} from './controllers';

export type SocketRouterOptions = {
    io:SocketIoServer;
    debug?:boolean,
    http?:never;
    socketServerOpt?:never;
} | {
    io?:never;
    debug?:boolean,
    http:HttpServer;
    socketServerOpt?:socketServerOptions;
};

export type socketServerOptions = {
    maxHttpBufferSize?:number
};

/** Socket controllers manager
*   Define each controllers logic as socket-controller-rdy:SocketController class
*   @method
*   
*/

export class SocketRouter {
    private io?:SocketIoServer;
    public id:string;
    private blueprints:any=[]; // To sanitize
    private controller:SocketController[] = [];

    constructor( id=uuid4() ){
        this.id = id;        
    }
    bind (opt:SocketRouterOptions)  {
        const { io, http, socketServerOpt, debug } = opt;
        
        if(io)
            this.io = io;
        else   
            this.io = io ? io : new SocketIoServer(http, {maxHttpBufferSize: 1e8, ...socketServerOpt });
        
        // To sanitize
        const controllerOpt = {
            socketServer: this.io,
            ...(debug ? {debug} : {debug:false}),
        };
        this.controller = this.blueprints.map( (c:any) => new c(controllerOpt) );
    }
    use<A extends SocketController>(controller: { new (p:SocketControllerParameters): A }) {  // When creating factories in TypeScript using generics, it is necessary to refer to class types by their constructor functions. 
                                                                  //https://www.reddit.com/r/typescript/comments/pxvifr/create_instance_of_generic_type_t/        
        //const _ = [controller];
        console.log("A new controller is used");
        console.dir(controller);
        this.blueprints.push( controller );
        //this.controller.push( new controller({socketServer: this.io}) );
    }   
}
