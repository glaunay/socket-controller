import { Server, Socket } from 'socket.io';
export { Server } from 'socket.io';
import { v4 as uuid4 } from 'uuid';
import {inspect} from 'util';

export interface SocketError {
    type:string,
    eventName?:string,
    content?: any
}

export type SocketManagerParameters = {
    socketServer:Server
    id?:string;
}

export abstract class  SocketManager {
    private socketServer:Server;
    id:string;

    listenerFns?:[string, Function][];
    
    constructor(params:SocketManagerParameters){     
        const { socketServer, id=uuid4() } = params;  
        this.id = id;
        this.socketServer = socketServer;

        this.socketServer.on("connection", (socket:Socket)=> {
            console.log("[SocketManager] New connection");
            this.listenerFns?.forEach(([fnName, listenDecoratedFn]) =>  {
                console.log("Dynamic binding of wrapper:" + fnName);
                listenDecoratedFn(socket)
            });
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


export function Listen(originalMethod: Function, context: ClassMethodDecoratorContext):any {
    
    function wrapper(this: any, ...args: any[]):Promise<any> {    
    // Maybe make it async to access mayBeResults in @Answer
        const fnNameAsEvent = originalMethod.name;
        console.log(`Listen wrapper of ${fnNameAsEvent}`);
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
        const self = this as SocketManager;
        if(!self.listenerFns)
            self.listenerFns = []
        // Should check for overwritings
        self.listenerFns.push([originalMethod.name, wrapper]);    
    });

    //wrapper();
    //return wrapper;
}

/** Decorate a "controler" function to bind its logic to a ws incoming event.
 * 
 *  Make the decorated function to receive data from the websocket 
 * on event with the same name as the decorated function,
 *  eg: myMethod will be triggered by 'myMethod' incoming event.
 *  The return value of the decorated function will be 
 *  emited back to ws client on an event of similar name.
 *  This return event can be renamed by providing an optional string
 *  to the decorator. eg: \@ListenTo('resultEvent'). 
*/
export function ListenTo(EmitEvtName?: string) {

    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;

        const fnNameAsEvent = originalMethod.name;
        context.addInitializer(function (...args: any) {
        /*
            Object is instanciated hook, b4 constructor
            We create the registering fn and add it to table
        */
            const self = this as SocketManager;
            
            function wrapper(this: any, ...args: any[]): Promise<any> {

                //console.log(`\t[ListenTo] starts wrapper: ${methodName}`);
                let maybeResults;
                // force async 
                return new Promise((res, rej) => {
                    //  console.log(`ListenTo:wrapper: ${methodName} socket bound to evt \"${fnNameAsEvent}\"`);
                    const rawSocket: Socket = args[0];
                    args[0].on(fnNameAsEvent, async (data?: any) => {
                        console.log(`ListenTo:wrapper: ${methodName} incoming!!!`);
                        //  console.log(`Listen wrapper INNER call of ${fnNameAsEvent} with ${data}`);
                        try { // encapsulating service errors

                            maybeResults = await Promise.resolve(
                                originalMethod.call(self, data, rawSocket));

                            console.log(`[@ListenTo] __RETURN__ ${maybeResults} emiting it under \"${EmitEvtName}\"`);
                            args[0].emit(EmitEvtName, maybeResults);
                            res(maybeResults);
                            // What do we do w/ mayresults ?
                        } catch (e) {
                            console.log(`[@ListenTo] __ERROR__ this error other the tube under \"${EmitEvtName}\"`);
                            args[0].emit(EmitEvtName, { type: 'error', content: e } as SocketError);
                           
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