import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/User.model";
import { sign as JwtSign, verify as jwtVerify } from "jsonwebtoken";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const generateRefreshToken = (user: IUser) => {
  return JwtSign({ id: user._id.toString() }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

const generateAccessToken = (user: IUser) => {
  return JwtSign(user.toJSON(), process.env.JWT_SECRET!, { expiresIn: "30m" });
};

export const signup = async (req: Request, res: Response, next: any) => {
  try {
    const { id } = await User.create(req.body);
    const user = (await User.findById(id)) as IUser;

    res.cookie("refreshToken", generateRefreshToken(user));
    res.status(201).json({ token: generateAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Username or password is incorrect!" });
    }

    if (!(await user.matchPassword(req.body.password))) {
      return res
        .status(400)
        .json({ msg: "Username or password is incorrect!" });
    }

    res.cookie("refreshToken", generateRefreshToken(user));
    res.status(201).json({ token: generateAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
      return res.sendStatus(403);
    }

    const { id } = jwtVerify(refreshToken, process.env.JWT_SECRET!) as {
      id: string;
    };
    const user = (await User.findById(id)) as IUser;
    res.json({ token: await generateAccessToken(user) });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);

    const { newPassword } = req.body;
    const { oldPassword } = req.body;

    if (newPassword && oldPassword) {
      await user?.changePassword(oldPassword, newPassword).catch((err) => {
        if (err.message !== "PASSWORD_NOT_MATCHED") {
          return next(err);
        }
        return res.status(400).json({ msg: "Password not matched!" });
      });
    }

    if (req.file) {
      const cloudUploadStream = cloudinary.uploader.upload_stream(
        { transformation: { width: 300, height: 300, crop: "fill" } },
        async (err, res) => {
          if (err) {
            return next(err);
          }
          user?.set("avatar", res?.url);
          await user?.save();
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(cloudUploadStream);
    }

    for (const key in req.body) {
      user?.set(key, req.body[key]);
    }

    await user?.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
