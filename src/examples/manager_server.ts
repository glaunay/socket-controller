import { createServer } from 'http' 

import { SocketRouter } from "../manager";
import {ssmOne, ssmTwo, ErrorService } from './simple_socket_controllers';

const http = createServer();

const ApiSocket = new SocketRouter();
ApiSocket.use(ssmOne);
ApiSocket.use(ssmTwo);
ApiSocket.use(ErrorService);

ApiSocket.bind({http, debug:true});

http.listen(8000);

