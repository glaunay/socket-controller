
/* Create an event with the decorated function name
The decorated function will be called back on event.
Any Error thrown in bound function will be captured and emited to the socket

*/
function Listen(originalMethod: any, _context: any) {
    function wrapper(this: any, ...args: any[]) {
        console.log("LOG: Entering method.")
        const result = originalMethod.call(this, ...args);
        console.log("LOG: Exiting method.")
        return result;
    }

    return wrapper;
}

// If an 
function Answer(returnEventName?:string){

}

// Pbbly abstract for many socket managment
/*abstract*/ class  SocketManager {
    static attach(socketServer:any) {
        
    }
    static say_hello(data:string) {
        console.log("SocketManager:say_hello receives " + data);
        // return "Bonjour"
    }

}

