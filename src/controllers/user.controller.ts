import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/User.model";
import { sign as JwtSign, verify as jwtVerify } from "jsonwebtoken";
import {
  changeUserPassword,
  updateUserAvatar,
  updateUserInfo,
} from "../services/user.services";
import Room, { IRoom } from "../models/Room.model";
import { Types } from "mongoose";
import Message from "../models/Message.model";

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
      sameSite: "lax",
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
      sameSite: "lax",
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
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
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
    const rooms = await Room.aggregate([
      {
        $match: {
          members: new Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "roomId",
          as: "lastMessage",
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "sender",
                pipeline: [
                  {
                    $addFields: {
                      id: "$_id",
                      fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$sender",
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",

          pipeline: [
            {
              $addFields: {
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                id: "$_id",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          id: "$_id",
        },
      },
      {
        $sort: {
          "lastMessage.createdAt": -1,
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "roomId",
          as: "unreadMessages",
          pipeline: [
            {
              $match: {
                seenBy: { $nin: [new Types.ObjectId(req.user.id)] },
                userId: {
                  $ne: new Types.ObjectId(req.user.id),
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          unreadMessagesCount: {
            $size: "$unreadMessages",
          },
        },
      },
    ]);

    res.json({ rooms });
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

    const users = await User.find({
      $or: [
        { username: new RegExp("^" + searchQuery + "$", "i") },
        {
          $and: [
            { firstName: new RegExp("^" + firstName + "$", "i") },
            { lastName: new RegExp("^" + lastName ? lastName : "" + "$", "i") },
          ],
        },
      ],
    }).limit(10);

    const groups = await Room.find({
      name: new RegExp("^" + searchQuery + "$", "i"),
    });

    res.json({ results: [...users, ...groups] });
  } catch (err) {
    next(err);
  }
};

export const addContact = async (
  req: Request<{}, {}, { userId: string }, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const room = await Room.findOne({ members: [userId, req.user.id] });

    if (room) {
      return res.json({ msg: "Room has been already created", room });
    }

    const newRoom = await Room.create({
      members: [userId, req.user.id],
    });

    const user1 = await User.findById(req.user.id);
    const user2 = await User.findById(userId);

    await user1?.addRoom(newRoom.id);
    await user2?.addRoom(newRoom.id);

    await user1?.addContact(user2?.id);
    await user2?.addContact(user1?.id);

    res.status(201).json({ room: newRoom });
  } catch (err) {
    next(err);
  }
};

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id).populate("contacts");
    if (!user) {
      throw new Error("User not found");
    }
    res.json({ contacts: user.contacts });
  } catch (err) {
    next(err);
  }
};
