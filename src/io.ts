import { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { authAsSocketMiddleware } from "./middlewares/auth";
import Room from "./models/Room.model";
import Message from "./models/Message.model";
import User, { IUser } from "./models/User.model";

export interface ISocket extends Socket {
  user?: IUser;
}

interface MessageRequest {
  text: string;
  roomId: string;
  messageId: string;
}

interface MessageSeenRequest {
  messageId: string;
}

const ioServer = (httpServer: Server) => {
  const io = new IOServer(httpServer, {
    cors: {
      origin: "http://127.0.0.1:5173",
      methods: ["GET", "POST"],
    },
  });
  io.use(authAsSocketMiddleware);
  io.on("connection", async (socket: ISocket) => {
    socket.join(socket.user?.id!.toString()!);
    const user = await User.findById(socket.user?.id);
    await user?.setIsOnline();

    socket.on("message", async (data: MessageRequest) => {
      const { text, roomId, messageId } = data;
      const room = await Room.findById(roomId);
      const message = await Message.findById(messageId);

      if (!room) {
        return socket.emit("error", {
          message: "No room found!",
        });
      }

      if (message) {
        return socket.emit("error", {
          message: "Id is already used",
        });
      }

      const newMessage = await (
        await Message.create({
          _id: messageId,
          text,
          roomId,
          userId: socket.user?.id,
        })
      ).populate([{ path: "room" }, { path: "sender" }]);

      socket.emit("delivered:" + messageId);

      for (const memberId of newMessage.room.members) {
        if (memberId == socket.user?.id) {
          console.log("yes");
          continue;
        }
        io.to(memberId.toString()).emit("message", newMessage);
      }
    });

    socket.on("seen", async (data: MessageSeenRequest) => {
      const message = await Message.findById(data.messageId).populate("room");
      if (!message) {
        return socket.emit("error", { msg: "Message not found!" });
      }
      if (!message.room.haveMember(socket.user?.id)) {
        return socket.emit("error", { msg: "Not Allowed" });
      }
      await message.markAsSeen();
    });

    socket.on("disconnect", async () => {
      const user = await User.findById(socket.user?.id);
      await user?.setIsOffline();
    });
  });
};

export default ioServer;
