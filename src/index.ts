import { Server, Socket } from 'socket.io';
export { Server } from 'socket.io';

import { inspect } from 'util';
import { isGeneratorFunction, isAsyncFunction } from 'util/types';

/* Create an event with the decorated function name
The decorated function will be called back on event.
Any Error thrown in bound function will be captured and emited to the socket

*/
function Example(originalMethod: any, _context: any) {
    console.log(`Example decorator factory`);
    function wrapper(this: any, ...args: any[]) {
        console.log(`LOG: Entering method named ${originalMethod.name}`)
        const result = originalMethod.call(this, ...args);
        console.log("LOG: Exiting method.")
        return result;
    }

    return wrapper;
}


function _Listen(originalMethod: Function, context: ClassMethodDecoratorContext):any {
    console.log(`Listen decorator factory for ${originalMethod}`);
    console.log("Using context to register");// + inspect (context));
   

    function wrapper(this: any, ...args: any[]) {    
    // Maybe make it async to access mayBeResults in @Answer
        const fnNameAsEvent = originalMethod.name;
        //console.log(`Listen wrapper of ${fnNameAsEvent}`);
        //console.log(this.socketServer);
        let maybeResults;
        // force async 
        args[0].on(fnNameAsEvent, async (data?:any)=> {
          //  console.log(`Listen wrapper INNER call of ${fnNameAsEvent} with ${data}`);
          try{ // encapsulating service errors
                maybeResults = await Promise.resolve(               
                    originalMethod.call(this, data));
                console.log("GOTCHA " + maybeResults);
                // What do we do w/ mayresults ?
          } catch (e) {
            console.log("We can emit this error other the tube"); 
          }
        })
        //const result = originalMethod.call(this, ...args);
        console.log("Listen decorated " + fnNameAsEvent);
        //return result;
    }
    //wrapper.name = "listenWrapper_" + originalMethod.name;
    context.addInitializer(function (...args:any) {
        console.log("Firing addInitializer" + args);
        if(!SocketManager.listenerFns)
            SocketManager.listenerFns = []
        SocketManager.listenerFns.push(/*originalMethod*/ wrapper);    
    });


    //wrapper();
    //return wrapper;
}


export function Listen(originalMethod: Function, context: ClassMethodDecoratorContext):any {
    console.log(`Listen decorator factory for ${originalMethod}`);
    console.log("Using context to register");// + inspect (context));
   

    function wrapper(this: any, ...args: any[]):Promise<any> {    
    // Maybe make it async to access mayBeResults in @Answer
        const fnNameAsEvent = originalMethod.name;
        //console.log(`Listen wrapper of ${fnNameAsEvent}`);
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
            }
            })
        //const result = originalMethod.call(this, ...args);        
        console.log("Listen decorated " + fnNameAsEvent);
        });
        //return result;
    }
    //wrapper.name = "listenWrapper_" + originalMethod.name;
    context.addInitializer(function (...args:any) {
        console.log("Firing addInitializer" + args);
        if(!SocketManager.listenerFns)
            SocketManager.listenerFns = []
        SocketManager.listenerFns.push(/*originalMethod*/ wrapper);    
    });

    //wrapper();
    //return wrapper;
}

// If no name is provided we try to infer from method name ?
export function ListenTo(EmitEvtName?:string){
   
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;
        
        console.log("Answer decorator binding to emit event " + EmitEvtName);
       /* function lazyEmit() {
            console.log("BIP BIP");
        }*/
        
        function wrapper(this: any, ...args: any[]):any {
            const fnNameAsEvent = originalMethod.name;
            //console.log(`Listen wrapper of ${fnNameAsEvent}`);
            //console.log(this.socketServer);
            let maybeResults;
            // force async 
            return new Promise ( (res, rej)=> {
                args[0].on(fnNameAsEvent, async (data?:any)=> {
              //  console.log(`Listen wrapper INNER call of ${fnNameAsEvent} with ${data}`);
                try{ // encapsulating service errors
                    maybeResults = await Promise.resolve(               
                        originalMethod.call(this, data));
    
                    console.log(`GOTCHA ${maybeResults} emiting it over \"${EmitEvtName}\"`);
                    this.socketServer.emit(EmitEvtName, maybeResults);
                    res(maybeResults);                    
                    // What do we do w/ mayresults ?
                } catch (e) {
                    console.log("[@Listen] We can emit this error other the tube"); 
                }
                })
            //const result = originalMethod.call(this, ...args);        
            console.log("Listen decorated " + fnNameAsEvent);
            });
            //return result;
        }

        context.addInitializer(function (...args:any) {
            console.log("Firing addInitializer" + args);
            if(!SocketManager.listenerFns)
                SocketManager.listenerFns = []
            SocketManager.listenerFns.push(/*originalMethod*/ wrapper);   
        });
        //wrapper.name = "listenWrapper_" + originalMethod.name;
    
        return wrapper;
    }
        
    
}



/*
TO use async?-yield to allow for multiple emit along the tube 

*/

// If no name is provided we try to infer from method name ?
export function Answer(EmitEvtName?:string){
   
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;
        
        console.log("Answer decorator binding to emit event " + EmitEvtName);
       /* function lazyEmit() {
            console.log("BIP BIP");
        }*/
        function wrapper(this: any, ...args: any[]):any {
            try {
                    new Promise( async (res, rej) => {
                    const result = await originalMethod.call(this, ...args);
                    this.socketServer.emit(EmitEvtName as string, result); 
                    });
                } catch(e) {
                    console.log("[@Answer] We can emit this error other the tube"); 
                }
        }

        return wrapper;
    }
}

export function AnswerMany(){
   
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
      
        
       console.log("AnswerMany decorating " + methodName);
       /* function lazyEmit() {
            console.log("BIP BIP");
        }*/
        function wrapper(this: any, ...args: any[]):any {
            try {
                new Promise( async (res, rej) => {
                    const generator = await originalMethod.call(this, ...args);
                    for await (let t of generator) 
                        this.socketServer.emit(t[0] as string, t[1]);                    
                    });
                } catch(e) {
                    console.log("[@AnswerMany] We can emit this error other the tube"); 
                }
        }

        return wrapper;
    }
}

/*
function loggedMethod(headMessage = "LOG:") {
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);

        function replacementMethod(this: any, ...args: any[]) {
            console.log(`${headMessage} Entering method '${methodName}'.`)
            const result = originalMethod.call(this, ...args);
            console.log(`${headMessage} Exiting method '${methodName}'.`)
            return result;
        }

        return replacementMethod;
    }
}*/


interface SocketError {};
const generateError = ()  => {

};
// Pbbly abstract for many socket managment
export abstract class  SocketManager {
    static listenerFns?:Function[];

    constructor(private socketServer:Server){      
        this.socketServer.on("connection", (socket:Socket)=> {
            SocketManager.listenerFns?.forEach((listenDecoratedFn:Function) =>  {
                console.log("Dynamic binding of " + listenDecoratedFn.name);
                listenDecoratedFn(socket)
            });
        });
        
    }
}