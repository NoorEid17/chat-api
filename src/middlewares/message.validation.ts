import { Request } from "express";
import { param } from "express-validator";
import { Types } from "mongoose";
import Room from "../models/Room.model";

export const validateGetMessages = [
  param("roomId")
    .notEmpty()
    .custom(async (value, { req }) => {
      const isValidMongoId = Types.ObjectId.isValid(value);
      if (!isValidMongoId) {
        return Promise.reject("Invalid room id");
      }
      const room = await Room.findById(value);

      if (!room) {
        return Promise.reject("Room not found");
      }

      if (!room.haveMember(req.user.id)) {
        return Promise.reject("Not Allowed");
      }
    }),
];
