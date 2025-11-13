import {
  SocketController,
  ListenTo,
  SocketControllerRegister,
} from "../controllers";
import { inspect } from "util";

@SocketControllerRegister
export class DemoACK extends SocketController {
  @ListenTo()
  ackboo(data: string, socket: any) {
    console.log(
      `[Controler] SocketManager[${this.id} / ${socket.id}]:\'ackboo\' reveives \"${inspect(data)}\"`,
    );
    socket.emit("noise", "Step one completed");
    return new Promise((res, rej) => {
      setTimeout(() => {
        const msg = `The server [${this.id}] is answering to you!`;
        res(msg);
      }, 2000);
    });
  }

  @ListenTo()
  ackbooError(data: string, socket: any) {
    console.log(
      `[Controler] SocketManager[${this.id} / ${socket.id}]:\'ackbooError\' reveives \"${inspect(data)}\"`,
    );

    throw new Error("Ackboo generated an error!");
  }
}
