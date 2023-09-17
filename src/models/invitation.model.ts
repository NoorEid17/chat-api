import { Document, model, ObjectId, Schema, Types } from "mongoose";
import Room, { IRoom } from "./Room.model";
import User, { IUser } from "./User.model";

interface Invitation extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  roomId: ObjectId;
  status: "pending" | "accepted" | "rejected";
  sender?: IUser;
  receiver?: IUser;
  room?: IRoom;

  reject(): Promise<any>;
  accept(): Promise<any>;
}

const schema = new Schema(
  {
    from: { type: Types.ObjectId, ref: "User" },
    to: { type: Types.ObjectId, ref: "User" },
    roomId: { type: Types.ObjectId, ref: "Room" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    methods: {
      reject: function () {
        this.status = "rejected";
        return this.save();
      },
      accept: async function () {
        this.status = "accepted";
        return this.save();
      },
    },
  }
);

schema.virtual("room", {
  ref: "Room",
  localField: "roomId",
  foreignField: "_id",
  justOne: true,
});

schema.set("toJSON", { virtuals: true });

const Invitation = model<Invitation>("invitation", schema);
export default Invitation;
