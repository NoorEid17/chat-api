import { body } from "express-validator";
import User from "../models/User.model";

export const validateCreateNewRoom = [
  body("members")
    .isArray()
    .isMongoId()
    .notEmpty()
    .custom(async (userId) => {
      const user = await User.findById(userId);
      if (!user) {
        return Promise.reject("User not found!");
      }
    }),
  body("name").isString().optional(),
  body("isGroup").isBoolean().notEmpty(),
];
