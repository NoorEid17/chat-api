import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/User.model";
import { sign as JwtSign, verify as jwtVerify } from "jsonwebtoken";
import {
  changeUserPassword,
  updateUserAvatar,
  updateUserInfo,
} from "../services/user.services";
import Room from "../models/Room.model";

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

    res.cookie("refreshToken", generateRefreshToken(user), {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
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

    res.cookie("refreshToken", generateRefreshToken(user), {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
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
    const user = (await User.findById(req.user.id)) as IUser;

    const { newPassword } = req.body;
    const { oldPassword } = req.body;

    if (newPassword && oldPassword) {
      await changeUserPassword(user, oldPassword, newPassword);
    }

    if (req.file) {
      await updateUserAvatar(user, req.file);
    }

    await updateUserInfo(user, req.body);

    res.json({ user });
  } catch (err: any) {
    if (err.message === "PASSWORD_NOT_MATCHED") {
      return res.status(400).json({ msg: "Password not matched!" });
    }
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("refreshToken");
    res.json({ msg: "Logged out successfully!" });
  } catch (err) {
    next(err);
  }
};

export const getRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "rooms",
        populate: {
          path: "members",
        },
      })
      .exec();
    res.json({ rooms: user?.rooms });
  } catch (err) {
    next(err);
  }
};

export const search = async (
  req: Request<{}, {}, {}, { searchQuery: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchQuery } = req.query;

    const firstName = searchQuery.split(" ")[0];
    const lastName = searchQuery.split(" ")[1];

    const usersByUsername = await User.find({
      username: new RegExp("^" + searchQuery + "$", "i"),
    }).limit(10);

    const usersByFullName = await User.find({
      firstName: new RegExp("^" + firstName + "$", "i"),
      lastName: new RegExp("^" + lastName ? lastName : "" + "$", "i"),
    });

    const groups = await Room.find({
      name: new RegExp("^" + searchQuery + "$", "i"),
    });

    res.json({ results: [...usersByUsername, ...usersByFullName, ...groups] });
  } catch (err) {
    next(err);
  }
};
