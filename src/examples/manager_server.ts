import { createServer } from 'http' 

import { SocketRouter } from "../manager";
import {ssmOne, ssmTwo } from './simple_socket_controllers';

const http = createServer();

const ApiSocket = new SocketRouter();
ApiSocket.use(ssmOne);
ApiSocket.use(ssmTwo);
ApiSocket.bind({http, debug:true});

http.listen(8000);

