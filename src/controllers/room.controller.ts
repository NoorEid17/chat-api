import { NextFunction, Request, Response } from "express";
import Room from "../models/Room.model";

export const createNewRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = new Room({ ...req.body });
    room.members.push(req.user.id as any);
    room.admins.push(req.user.id as any);
    await room.save();
    res.status(201).json({ room });
  } catch (err) {
    next(err);
  }
};
