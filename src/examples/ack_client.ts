import { io } from "socket.io-client";

console.log("\t####Testing acknoledgment callback####");

const ackTestClient = () => {
  const socket = io(`http://localhost:5000/DemoACK`);
  socket.on("noise", (d: any) => {
    console.log(`Some noise:: ${d}`);
  });
  socket.on("connect", () => {
    socket.emit("ackboo", { some: "stuff" }, (d: any) => {
      console.log(`ACK callback received:${d}`);
    });

    setTimeout(() => {
      socket.emit("ackbooError", { some: "stuff" });
    }, 1000);

    socket.on("ackbooError", (d) => {
      console.log("Received following err ");
      console.log(d);
    });
  });
};

ackTestClient();
