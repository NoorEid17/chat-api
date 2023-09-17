import { NextFunction, Request, Response } from "express";
import { ioServer } from "../app";
import Invitation from "../models/invitation.model";
import Room from "../models/Room.model";
import User from "../models/User.model";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invitation = await (
      await Invitation.create({
        ...req.body,
        from: req.user.id,
      })
    ).populate(["room", "from"]);

    ioServer.to(invitation.to.toString()).emit("invitation", invitation); // Notify User about the invitation

    res.status(201).json({ invitation });
  } catch (err) {
    next(err);
  }
};

export const getReceivedPendingInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invitations = await Invitation.find({
      status: "pending",
      to: req.user.id,
    })
      .populate("from")
      .populate("room");
    res.json({ invitations });
  } catch (err) {
    next(err);
  }
};

export const accept = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { invitationId } = req.params;
    const invitation = await Invitation.findById(invitationId);

    if (invitation?.to != req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const room = await Room.findById(invitation.roomId);
    const user = await User.findById(invitation.to);

    if (!room) {
      throw new Error("Room not found!");
    }

    if (!user) {
      throw new Error("User not found!");
    }

    await Promise.all([
      room.addMember(user.id),
      user.addRoom(room.id),
      invitation.accept(),
    ]);

    res.json({ msg: "Invitation Accepted and room joined!" });
  } catch (err) {
    next(err);
  }
};

export const reject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { invitationId } = req.params;
    const invitation = await Invitation.findById(invitationId);

    if (invitation?.to != req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const room = await Room.findById(invitation?.roomId);
    const user = await User.findById(invitation?.to);

    if (!room) {
      throw new Error("Room not found!");
    }

    if (!user) {
      throw new Error("User not found!");
    }

    await invitation?.reject();

    res.json({ msg: "Invitation rejected" });
  } catch (err) {
    next(err);
  }
};
