import { IUser } from "../models/User.model";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const updateUserInfo = async (user: IUser, data: any) => {
  for (const key in data) {
    user.set(key, data[key]);
  }

  return user.save();
};

export const updateUserAvatar = async (user: IUser, avatar: any) => {
  const cloudUploadStream = cloudinary.uploader.upload_stream(
    { transformation: { width: 300, height: 300, crop: "fill" } },
    async (err, res) => {
      if (err) {
        throw err;
      }
      user?.set("avatar", res?.url);
      await user?.save();
    }
  );
  streamifier.createReadStream(avatar.buffer).pipe(cloudUploadStream);
};

export const changeUserPassword = async (
  user: IUser,
  oldPassword: string,
  newPassword: string
) => {
  if (!(await user.matchPassword(oldPassword))) {
    throw new Error("PASSWORD_NOT_MATCHED");
  }
  user.set("password", newPassword);
  return user.save();
};
