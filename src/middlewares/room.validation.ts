import { body } from "express-validator";

export const validateCreateNewRoom = [
  body("name").isString().optional(),
  body("isGroup").isBoolean().notEmpty(),
];
