import { createServer } from "http";

import { SocketRouter } from "../manager";
import { ssmOne, ssmTwo, ErrorService } from "./simple_socket_controllers";
import { DemoACK } from "./ackboo";

const http = createServer();

const ApiSocket = new SocketRouter();
ApiSocket.use(ssmOne);
ApiSocket.use(ssmTwo);
ApiSocket.use(ErrorService);
ApiSocket.use(DemoACK);

ApiSocket.bind({ http, debug: true });

http.listen(5000);
