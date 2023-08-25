import { Document, Model, model, Schema, Types } from "mongoose";
import { compare, compareSync, hash, hashSync } from "bcryptjs";
import { IRoom } from "./Room.model";

export interface IUser extends Document {
  id: string;
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  fullName: string;
  bio: string;
  avatar: string;
  rooms: IRoom[] | string[];
  matchPassword(inputPassword: string): boolean;
}

const schema = new Schema(
  {
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
    rooms: [{ type: Types.ObjectId, ref: "Room" }],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    methods: {
      matchPassword(this: IUser, inputPassword: string) {
        return compare(inputPassword, this.password);
      },
    },
  }
);

schema.pre("save", function () {
  if (this.isNew || this.isModified("password")) {
    this.password = hashSync(this.password, process.env.BCRYPT_SALT);
  }
});

schema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

schema.set("toJSON", {
  virtuals: true,
  transform(doc, ret, options) {
    delete ret["password"];
  },
});

const User = model<IUser>("User", schema);

export default User;
