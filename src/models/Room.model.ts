import { Schema, model, Types } from "mongoose";

const schema = new Schema({
  name: String,
  members: [{ type: Types.ObjectId, ref: "User" }],
  admins: [{ type: Types.ObjectId, ref: "User" }],
  isGroup: Boolean,
});

const roomModel = model("Room", schema);
export default roomModel;
