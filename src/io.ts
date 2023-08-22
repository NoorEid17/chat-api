import { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { authAsSocketMiddleware } from "./middlewares/auth";
import Room from "./models/Room.model";
import Message from "./models/Message.model";
import { IUser } from "./models/User.model";

export interface ISocket extends Socket {
  user?: IUser;
}

interface MessageRequest {
  text: string;
  roomId: string;
}

const ioServer = (httpServer: Server) => {
  const io = new IOServer(httpServer);
  io.use(authAsSocketMiddleware);
  io.on("connection", (socket: ISocket) => {
    socket.join(socket.user?.id!.toString()!);
    socket.on("message", async (data: MessageRequest) => {
      const { text, roomId } = data;
      const room = await Room.findById(roomId);

      if (!room) {
        return socket.emit("error", {
          message: "No room found!",
        });
      }

      const message = await (
        await Message.create({ text, roomId })
      ).populate("room");

      for (const memberId of message.room.members) {
        io.to(memberId.toString()).emit("message", message);
      }
    });
  });
};

export default ioServer;
