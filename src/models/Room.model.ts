import { Schema, model, Types, ObjectId, Model, Document } from "mongoose";
import { IMessage } from "./Message.model";

export interface IRoom extends Document {
  _id: string;
  name: string;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  isGroup: boolean;
  lastMessage?: IMessage;
  avatar: string;

  haveMember(userId: any): boolean;
  addMember(userId: ObjectId): Promise<any>;
}

const schema = new Schema(
  {
    name: String,
    members: [{ type: Types.ObjectId, ref: "User" }],
    admins: [{ type: Types.ObjectId, ref: "User" }],
    isGroup: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
  },
  {
    methods: {
      haveMember(userId) {
        return this.members.includes(userId);
      },
      addMember(this: IRoom, userId: Types.ObjectId) {
        if (!this.haveMember(userId)) {
          this.members.push(userId);
          return this.save();
        }
        return;
      },
    },
  }
);

schema.set("toJSON", {
  virtuals: true,
});

const Room = model<IRoom>("Room", schema);
export default Room;
