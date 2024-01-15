import { Server, Socket } from 'socket.io';
import { inspect } from 'util';
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


function Listen(originalMethod: Function, context: ClassMethodDecoratorContext):any {
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
                console.log("We can emit this error other the tube"); 
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
function Answer(EmitEvtName?:string){
   
    return function actualDecorator(originalMethod: any, context: ClassMethodDecoratorContext) {
        const methodName = String(context.name);
        EmitEvtName = EmitEvtName ?? methodName;
        
        console.log("Answer decorator binding to emit event " + EmitEvtName);
        function wrapper(this: any, ...args: any[]):any {
            new Promise( async (res, rej) => {
                //@ts-ignore
                const result = await originalMethod.call(this, ...args);
                this.socketServer.emit(EmitEvtName as string, result); 
            });
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

// Pbbly abstract for many socket managment
export /*abstract*/ class  SocketManager {

    //private static socketServer:Server;

    /*static attach(socketServer:Server) {
        SocketManager.socketServer = socketServer;
    }*/
    static listenerFns?:Function[];

    //@ts-ignore
    constructor(private socketServer){
        //this.say_hello("_");
        //@ts-ignore
        this.socketServer.on("connection", (socket:Socket)=> {
            SocketManager.listenerFns?.forEach((listenDecoratedFn:Function) =>  {
                console.log("Dynamic binding of " + listenDecoratedFn.name);
                listenDecoratedFn(socket)
            });
        });
        
        //@ts-ignore        
        //this.socketServer.on("connection", (socket:Socket)=> this.say_hello2(socket));

        //this.socketServer.on("say_hello",function(){console.log("basic success");});
        //@ts-ignore
        //console.log("CONSTRUCTOR RUN TIME CONTENT OF listenerFns" + SocketManager.listenerFns);
    }
  /*
    @Example
    bonjour(data:string) {
        console.log("SocketManager:bonjour receives " + data);
    }
    */

    @Listen
    say_hello(data:string) {
        console.log("[SUCCESS] SocketManager:say_hello receives " + data);
        return "Bonjour"
    }

    @Listen
    say_hello2(data:string) {
        console.log("[SUCCESS] SocketManager:say_hello2 receives " + data);
        return "Bonjour"
    }

    @Listen
    say_hello3(data:string) {
        console.log("[SUCCESS] SocketManager:say_hello3 receives " + data);       
        if(data === "panic input")
            throw new Error("say hello3 runtime error");
        return "Bonjour"
    }
   
    // Only emit case
    @Answer('server_cast')
    hail(msg:string) {
        //const msg="The server is hailing you!";
        console.log(`I emiting \"${msg}\" over [server_cast]`);
        return msg;
    }

    
    // emit triggered by succesfull listen
    @Answer('server_reply')
    //@Listen
    discuss(data:string) {
        const msg="The server is hailing you!";
        console.log(`I emiting \"${msg}\" over [server_reply]`);
        return msg;
    }

}

