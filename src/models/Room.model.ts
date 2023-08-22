import { Schema, model, Types, ObjectId } from "mongoose";

export interface IRoom {
  name: string;
  members: string[];
  admins: ObjectId[];
  isGroup: boolean;
}

const schema = new Schema({
  name: String,
  members: [{ type: Types.ObjectId, ref: "User" }],
  admins: [{ type: Types.ObjectId, ref: "User" }],
  isGroup: Boolean,
});

const roomModel = model<IRoom>("Room", schema);
export default roomModel;
