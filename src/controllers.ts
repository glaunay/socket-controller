import { Server, Socket, Namespace } from 'socket.io';
export { Server, Socket } from 'socket.io';
import { v4 as uuid4 } from 'uuid';
import { isAbsolute } from 'path';

export interface SocketError {
    type:string,
    eventName?:string,
    content?: any
}

export type SocketControllerParameters = {
    socketServer:Server;
    route?:string;
    id?:string;
    debug?:boolean;
}

class SocketControllerCreationError extends Error{};

type ConnectionID = string;

const SubMethods = Symbol('__SocketControllerMethods__'); // just to be sure there won't be collisions
const BaseName  =  Symbol('__BaseName__');
// Here we only register 
export function ListenTo(requestName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    target[SubMethods] = target[SubMethods] || new Map();
    // Here we just add some information that class decorator will use
    target[SubMethods].set(propertyKey, requestName);
  };
}

export function SocketControllerRegister<T extends { new(...args: any[]): {} }>(Base: T) {
  return class extends Base {
    constructor(...args: any[]) {    
        //const _ = args[0];
        //console.log("Class wrapper of " + Base.name );
        
        args[0]['route'] = `/${Base.name}`;
        // Create the concrete controller
        super(...args);
      
        const self = this as unknown as SocketController;
       // Configure the associated socket
       //console.log(self.app);
        self.app.on("connection", (socket: Socket) => {           
            if (self.debug)
                console.log(`[SocketManager] New connection [${socket.id.slice(0, 4)}]`);

            const subMethods = Base.prototype[SubMethods];
            if (subMethods) {
                subMethods.forEach((requestName: string, method: string) => {
                    console.log(requestName + "," + method);
                    const ansEvtName = requestName ?? method;
                    socket.on(method, async (...sockArgs:any[]) => {
                        if(self.debug){
                            console.log(`ListenTo: incoming event \"${method}\" on socket ${socket.id.slice(0,4)} <<<<`);
                            console.log(`\tdata: ${sockArgs}`);
                        }
                        try { // encapsulating service errors
                            // passing concrete socket as trailer arg to decorated fn
                            const maybeResults = await Promise.resolve(
                                (self as any)[method](...sockArgs, socket));
                            console.log(`ListenTo: outgoing event \"${ansEvtName}\" on socket ${socket.id.slice(0,4)} <<<<`);    
                            console.log(`\tdata: ${maybeResults}`);
                            socket.emit(ansEvtName, maybeResults);
                        } catch (e) {
                            if(self.debug){
                                console.log(`ListenTo: __ERROR__ emiting it under \"${ansEvtName}\"`);
                                console.log(`\tcontent: ${e}`);
                            }
                            socket.emit(ansEvtName as string, 
                                { type: 'error', content: e } as SocketError);
                            }
                    })
                })
            }
        });
    }}};
                  /*  socket.on(fnNameAsEvent, async (data?: any) => {
                        if(self.debug){
                            console.log(`ListenTo: incoming event \"${methodName}\" on socket ${socket.id.slice(0,4)} <<<<`);
                            console.log(`\tdata: ${data}`);
                        }
                        try { // encapsulating service errors
                            // passing concrete socket as trailer arg to decorated fn
                            const maybeResults = await Promise.resolve(
                                originalMethod.call(self, data, socket));
                            if(self.debug){
                                console.log(`ListenTo: outgoing event \"${methodName}\" on socket ${socket.id.slice(0,4)} <<<<`);    
                                console.log(`\tdata: ${maybeResults}`);
                            }
                            socket.emit(EmitEvtName as string, maybeResults);
                            res(maybeResults); // so what                            
                        } catch (e) {
                            if(self.debug){
                                console.log(`ListenTo: __ERROR__ emiting it under \"${EmitEvtName}\"`);
                                console.log(`\tcontent: ${e}`);
                            }
                            socket.emit(EmitEvtName as string, 
                                { type: 'error', content: e } as SocketError);
                           
                        }
                    })*/
                   

          /*
          WebsocketHandler.getInstance()
            .registerRequestHandler(
              requestName,
              () => (this as any)[method]()
            );
            */



export abstract class SocketController {
    private socketServer:Server;
    public app:Namespace
    public debug:boolean;

    id:string;
    namespace:string;

    constructor(params:SocketControllerParameters){     
        const { socketServer, id = uuid4(),
            route,
            debug = false } = params;
          
        if (!isAbsolute(route as string)) // in-case use inputed
            throw new SocketControllerCreationError(`The route parameter \"${route}\" must be an absolute path`);
        
        //console.log(params);
        
        this.id = id;
        this.socketServer = socketServer;
        this.namespace = route as string;
        this.app = this.socketServer.of(this.namespace);
        this.debug = debug;

        if (this.debug)
            console.log("[SocketManager] Hosting namespace @ " + this.namespace);

    }
}

//https://stackoverflow.com/questions/61439271/can-i-access-the-target-class-instance-in-a-typescript-method-decorator
// Need to override constructor at class lvl decorator
export abstract class __SocketController {
    private socketServer:Server;
    private app:Namespace
    public debug:boolean;

    id:string;
    namespace:string;
    listenerFns?:[string, Function][];
    
    constructor(params:SocketControllerParameters){     
        const { socketServer, id=uuid4(), 
                route=`/${this.constructor.name}`,
                debug = false } = params;  
        if(!isAbsolute(route)) // in-case use inputed
            throw new SocketControllerCreationError(`The route parameter \"${route}\" must be an absolute path`);
        
        this.id           = id;
        this.socketServer = socketServer;
        this.namespace    = route;
        this.app = this.socketServer.of(this.namespace);
        this.debug = debug;

        if(this.debug)
            console.log("[SocketManager] Hosting namespace @ " + this.namespace);
       

        this.app.on("connection", (socket:Socket)=> {
            console.log("connection !");
            if(this.debug)
                console.log(`[SocketManager] New connection [${socket.id.slice(0, 4)}]`);
            this.listenerFns?.forEach(([fnName, listenDecoratedFn]) =>  {
                //console.log("[Sokcet]Dynamic binding of wrapper:" + fnName);
                listenDecoratedFn(socket)
            });
            //socket.on('disconnect', ()=>this._cleanup())
        });   
    }
    errorFormater(e:any):SocketError {
    /* Dummy error formater
        meant to be redefined
    */
        const m:Partial<SocketError> = {type:'error', eventName: 'SocketError'}
        if(e)
            m.content = e;
        return m as SocketError;
    };
}

