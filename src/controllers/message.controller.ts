import { NextFunction, Request, Response } from "express";
import Message from "../models/Message.model";

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 5);

    const messages = await Message.find({ roomId: req.params.roomId })
      .sort("-createdAt")
      .skip(size * (page - 1))
      .limit(size);

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};
