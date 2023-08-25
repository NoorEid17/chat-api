import { Request } from "express";
import { param } from "express-validator";
import Room from "../models/Room.model";

export const validateGetMessages = [
  param("roomId")
    .notEmpty()
    .isMongoId()
    .custom(async (value, { req }) => {
      const room = await Room.findById(value);

      if (!room) {
        return Promise.reject("Room not found");
      }

      if (!room.haveMember(req.user.id)) {
        return Promise.reject("Not Allowed");
      }
    }),
];
