import { body, param } from "express-validator";
import Invitation from "../models/invitation.model";
import Room from "../models/Room.model";
import User from "../models/User.model";

export const validateCreateInvitation = [
  body("roomId")
    .isMongoId()
    .custom(async (value, { req }) => {
      const room = await Room.findById(value);
      if (!room) {
        return Promise.reject("Room not found!");
      }
      if (!room.isGroup) {
        return Promise.reject("Room isn't a group!");
      }
      if (!room.admins.includes(req.user.id)) {
        return Promise.reject("Not allowed!");
      }
    }),
  body("to")
    .isMongoId()
    .custom(async (value) => {
      const user = await User.findById(value);
      if (!user) {
        return Promise.reject("User not found!");
      }
    }),
];

export const validateUpdateInvitation = [
  param("invitationId")
    .isMongoId()
    .custom(async (value) => {
      const invitation = await Invitation.findById(value);
      if (invitation) {
        return Promise.reject("Invitation not found!");
      }
    }),
];
