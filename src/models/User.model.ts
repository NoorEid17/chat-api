import { Document, Model, model, Schema, Types } from "mongoose";
import { compare, compareSync, hash, hashSync } from "bcryptjs";

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
  matchPassword(inputPassword: string): boolean;
  changePassword(newPassword: string, oldPassword: string): Promise<any>;
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
    contacts: [{ type: Types.ObjectId, ref: "User" }],
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
      async changePassword(
        this: IUser,
        oldPassword: string,
        newPassword: string
      ) {
        if (!(await this.matchPassword(oldPassword))) {
          throw new Error("PASSWORD_NOT_MATCHED");
        }
        this.set("password", newPassword);
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
