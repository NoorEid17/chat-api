import { Server } from "http";
import { Server as IOServer } from "socket.io";

const ioServer = (httpServer: Server) => {
  const io = new IOServer(httpServer);
  io.on("connection", (socket) => console.log("client connected!"));
};

export default ioServer;
