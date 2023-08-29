import { Document, model, Schema, Types } from "mongoose";
import { IRoom } from "./Room.model";

interface IMessage extends Document {
  text: string;
  media: string;
  room: IRoom;
  roomId: IRoom;
  seenAt: number[];

  markAsSeen(): Promise<any>;
}

const schema = new Schema(
  {
    _id: String,
    roomId: { type: Types.ObjectId, ref: "Room" },
    userId: { type: Types.ObjectId, ref: "User" },
    text: String,
    media: String,
    seenAt: [
      {
        date: Date,
        user: { type: Types.ObjectId, ref: "User" },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    methods: {
      markAsSeen(this: IMessage) {
        this.seenAt.push(Date.now());
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

const messageModel = model<IMessage>("Message", schema);
export default messageModel;
