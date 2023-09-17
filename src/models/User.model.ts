import { Document, Model, model, ObjectId, Schema, Types } from "mongoose";
import { compare, compareSync, hash, hashSync } from "bcryptjs";
import { IRoom } from "./Room.model";

export interface IUser extends Document {
  id: Types.ObjectId;
  _id: Types.ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  fullName: string;
  bio: string;
  avatar: string;
  rooms: IRoom[] | string[];
  contacts: ObjectId[];
  isOnline: boolean;

  matchPassword(inputPassword: string): boolean;
  setIsOnline(): Promise<this>;
  setIsOffline(): Promise<this>;
  addRoom(userId: string): Promise<this>;
  addContact(userId: ObjectId): Promise<any>;
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
    contacts: [{ type: Types.ObjectId, ref: "User" }],
    isOnline: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    methods: {
      matchPassword(this: IUser, inputPassword: string) {
        return compare(inputPassword, this.password);
      },
      setIsOnline(this: IUser) {
        this.isOnline = true;
        return this.save();
      },
      setIsOffline(this: IUser) {
        this.isOnline = false;
        return this.save();
      },
      addRoom(this: IUser, roomId: string) {
        this.rooms.push(roomId as any);
        return this.save();
      },
      addContact(userId: ObjectId) {
        if (!this.contacts.includes(userId)) {
          this.contacts.push(userId);
        }
        return this.save();
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
