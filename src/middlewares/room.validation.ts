import { body, param } from "express-validator";
import Room from "../models/Room.model";

export const validateCreateNewRoom = [
  body("name").isString().optional(),
  body("isGroup").isBoolean().notEmpty(),
];

export const validateUpdateAvatar = [
  param("roomId")
    .notEmpty()
    .isMongoId()
    .custom(async (value) => {
      const room = await Room.findById(value);
      if (!room) {
        return Promise.reject("room not found!");
      }
      if (!room.isGroup) {
        return Promise.reject("room isn't a group!");
      }
    }),
];
