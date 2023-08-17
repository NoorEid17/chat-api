import { model, Schema, Types } from "mongoose";

interface IUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  fullName: string;
  bio: string;
  avatar: string;
}

const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: String,
  lastName: String,
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  bio: String,
  avatar: String,
  contacts: [{ type: Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const userModel = model<IUser>("User", schema);

export default userModel;
