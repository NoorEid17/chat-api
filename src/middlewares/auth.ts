import { Request, Response } from "express";
import { TokenExpiredError, verify as jwtVerify } from "jsonwebtoken";
import { IUser } from "../models/User.model";
import { ISocket } from "../io";

export const authAsSocketMiddleware = (socket: ISocket, next: any) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;
    if (!token) {
      return next(new Error("No Auth token provided!"));
    }
    const user = jwtVerify(token, process.env.JWT_SECRET!);
    socket.user = user as any;
    return next();
  } catch (err) {
    next(new Error("Invalid Auth token"));
  }
};

export default ({ optional }: { optional?: boolean } = { optional: false }) =>
  async (req: Request, res: Response, next: any) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (token) {
        const payload = jwtVerify(token, process.env.JWT_SECRET!) as IUser;
        req.user = payload;
        return next();
      }
      if (!token && !optional) {
        return res.status(403).json({ msg: "Access Forbidden!" });
      }
      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        res.status(403).json({ msg: "Access Forbidden!" });
      }
      next(err);
    }
  };
