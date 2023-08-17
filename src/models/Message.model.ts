import { model, Schema, Types } from "mongoose";

const schema = new Schema({
  roomId: { type: Types.ObjectId, ref: "Conversation" },
  userId: { type: Types.ObjectId, ref: "User" },
  text: String,
  media: String,
  createdAt: { type: Date, default: Date.now() },
});

const messageModel = model("Message", schema);
export default messageModel;