import { model, Schema, Types } from "mongoose";
import { IRoom } from "./Room.model";

interface IMessage {
  text: string;
  media: string;
  room: IRoom;
  roomId: IRoom;
}

const schema = new Schema({
  roomId: { type: Types.ObjectId, ref: "Room" },
  userId: { type: Types.ObjectId, ref: "User" },
  text: String,
  media: String,
  seen_at: [
    {
      date: Date,
      user: { type: Types.ObjectId, ref: "User" },
    },
  ],
  createdAt: { type: Date, default: Date.now() },
});

schema.virtual("room", {
  ref: "Room",
  localField: "roomId",
  foreignField: "_id",
  justOne: true,
});

const messageModel = model<IMessage>("Message", schema);
export default messageModel;
