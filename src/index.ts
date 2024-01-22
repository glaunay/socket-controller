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

export abstract class SocketController {
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

// NEEDS REWORK
export function Listen(originalMethod: Function, context: ClassMethodDecoratorContext):any {
    
    function wrapper(this: any, ...args: any[]):Promise<any> {    
    // Maybe make it async to access mayBeResults in @Answer
        const fnNameAsEvent = originalMethod.name;
       
        //console.log(this.socketServer);
        let maybeResults;
        // force async 
        return new Promise ( (res, rej)=> {
            args[0].on(fnNameAsEvent, async (data?:any)=> {
          //  console.log(`Listen wrapper INNER call of ${fnNameAsEvent} with ${data}`);
            try{ // encapsulating service errors
                maybeResults = await Promise.resolve(               
                    originalMethod.call(this, data));

                console.log("GOTCHA " + maybeResults);
                res(maybeResults);
                // What do we do w/ mayresults ?
            } catch (e) {
                console.log("[@Listen] We can emit this error other the tube");
                //const socketError = this.errorFormater(e)
            }
            })
        //const result = originalMethod.call(this, ...args);        
        console.log("Listen decorated " + fnNameAsEvent);
        });
        //return result;
    }
    //wrapper.name = "listenWrapper_" + originalMethod.name;
    context.addInitializer(function (...args:any) {
        //console.log("Firing addInitializer " + args[0]);
        //console.log("Firing addInitializer " + inspect(this));
        const self = this as SocketController;
        if(!self.listenerFns)
            self.listenerFns = [];
        // Should check for overwritings
        self.listenerFns.push([originalMethod.name, wrapper]);    
    });

    //wrapper();
    //return wrapper;
}


/** Decorate a "controller" method to bind its logic to a ws incoming event.
 * 
 *  Make the decorated function receiving data from the websocket 
 *  on event with the same name as the decorated function,
 *  eg: myMethod will be triggered by 'myMethod' incoming event.
 *  The return value of the decorated function will be 
 *  emited back to ws client on an event of similar name.
 *  This return event can be renamed by providing an optional string
 *  to the decorator. eg: \@ListenTo('resultEvent'). 
*/
export function ListenTo(EmitEvtName?: string):any {

    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;

        const fnNameAsEvent = originalMethod.name;
        context.addInitializer(function (...args: any) {
        /*
            Object is instanciated hook, b4 constructor
            We create the registering fn and add it to table
        */
            const self = this as SocketController;
            
            function wrapper(socket:Socket, ...args: any[]): Promise<any> {
                if(self.debug){
                    console.log(`Binding event \"${EmitEvtName}\" to socket ${socket.id.slice(0,4)}`)
                    console.log(`\t[ListenTo] starts wrapper: ${methodName}`);
                }
              
                // force async 
                return new Promise((res, rej) => {
                    //  console.log(`ListenTo:wrapper: ${methodName} socket bound to evt \"${fnNameAsEvent}\"`);
                  
                    socket.on(fnNameAsEvent, async (data?: any) => {
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
                    })
                   
                });
                //return result;
            }

            if (!self.listenerFns)
                self.listenerFns = []
            self.listenerFns.push([methodName, wrapper]);
        });       
    }
}