import { Server, Socket } from 'socket.io';
export { Server } from 'socket.io';


interface SocketError {
    eventName:string,
    content?: any
}

export abstract class  SocketManager {
    static listenerFns?:[string, Function][];

    constructor(private socketServer:Server){      
        this.socketServer.on("connection", (socket:Socket)=> {
            console.log("[SocketManager] New connection");
            SocketManager.listenerFns?.forEach(([fnName, listenDecoratedFn]) =>  {
                console.log("Dynamic binding of wrapper:" + fnName);
                listenDecoratedFn(socket)
            });
        });
        
    }
    static errorFormater(e:any):SocketError {
    /* Dummy error formater
        meant to be redefined
    */
        const m:Partial<SocketError> = {eventName: 'SocketError'}
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
                const socketError = SocketManager.errorFormater(e)
            }
            })
        //const result = originalMethod.call(this, ...args);        
        console.log("Listen decorated " + fnNameAsEvent);
        });
        //return result;
    }
    //wrapper.name = "listenWrapper_" + originalMethod.name;
    context.addInitializer(function (...args:any) {
      //  console.log("Firing addInitializer" + args);
        if(!SocketManager.listenerFns)
            SocketManager.listenerFns = []
        // Should check for overwritings
        SocketManager.listenerFns.push([originalMethod.name, wrapper]);    
    });

    //wrapper();
    //return wrapper;
}

// If no name is provided we try to infer from method name ?
export function ListenTo(EmitEvtName?:string){
   
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        //console.log("Decorating with ListenTo")
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;

        const fnNameAsEvent = originalMethod.name;

        /*
        console.log("\t[ListenTo] decorator binding listen event " + fnNameAsEvent);
        console.log("\t[ListenTo] decorator binding emit event " + EmitEvtName);
        */
       /*
       Currently resolve to decorated function results
       */
        function wrapper(this: any, ...args: any[]):Promise<any> {
     
            //console.log(`\t[ListenTo] starts wrapper: ${methodName}`);
            let maybeResults;
            // force async 
            return new Promise ( (res, rej)=> {
              //  console.log(`ListenTo:wrapper: ${methodName} socket bound to evt \"${fnNameAsEvent}\"`);
                const rawSocket:Socket = args[0];
                args[0].on(fnNameAsEvent, async (data?:any)=> {
                    console.log(`ListenTo:wrapper: ${methodName} incomig!!!`);
                    //  console.log(`Listen wrapper INNER call of ${fnNameAsEvent} with ${data}`);
                try{ // encapsulating service errors
                    maybeResults = await Promise.resolve(               
                        originalMethod.call(this, data, rawSocket));
    
                    console.log(`GOTCHA ${maybeResults} emiting it over \"${EmitEvtName}\"`);
                    this.socketServer.emit(EmitEvtName, maybeResults);
                    res(maybeResults);                    
                    // What do we do w/ mayresults ?
                } catch (e) {
                    console.log("[@ListenTo] We can emit this error other the tube"); 
                }
                })
                //console.log("[ListenTo] Wrapping ends " + fnNameAsEvent);
            });
            //return result;
        }

        context.addInitializer(function (...args:any) {
            console.log("ListenTo: Firing addInitializer" + args);
            if(!SocketManager.listenerFns)
                SocketManager.listenerFns = []
            SocketManager.listenerFns.push([methodName, wrapper]);   
        });
        //wrapper.name = "listenWrapper_" + originalMethod.name;
    
    }
        
    
}