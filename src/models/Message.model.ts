import { Document, model, Schema, Types } from "mongoose";
import { IRoom } from "./Room.model";

export interface IMessage extends Document {
  text: string;
  media: string;
  room: IRoom;
  roomId: IRoom;
  seenBy: string[];
  userId: Types.ObjectId;

  markAsSeen(userId: Types.ObjectId | string): Promise<any>;
}

const schema = new Schema(
  {
    _id: String,
    roomId: { type: Types.ObjectId, ref: "Room" },
    userId: { type: Types.ObjectId, ref: "User" },
    text: String,
    media: String,
    seenBy: [
      {
        type: Types.ObjectId,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    methods: {
      markAsSeen(this: IMessage, userId) {
        this.seenBy.push(userId);
        return this.save();
      },
    },
  }
);

schema.set("toJSON", { virtuals: true });

schema.virtual("room", {
  ref: "Room",
  localField: "roomId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("sender", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

const Message = model<IMessage>("Message", schema);
export default Message;
