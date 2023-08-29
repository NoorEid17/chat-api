import { Request } from "express";
import { body, query } from "express-validator";
import User from "../models/User.model";

const checkUsernameUsed = async (username: string, { req }: { req: any }) => {
  const user = await User.findOne({
    $and: [{ username: { $ne: req.user.username } }, { username: username }],
  });

  if (user) {
    return Promise.reject("Username is already used!");
  }
};

export const validateSignup = [
  body("username")
    .isString()
    .notEmpty()
    .isLength({ min: 5, max: 150 })
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        return Promise.reject("Username is already used!");
      }
    }),
  body("password").isString().notEmpty().isLength({ min: 3, max: 150 }),
  body("firstName").isString().notEmpty().isLength({ min: 3, max: 40 }),
  body("lastName").isString().optional().isLength({ max: 150 }),
];

export const validateLogin = [
  body("username").isString().notEmpty().isLength({ min: 5, max: 150 }),
  body("password").isString().notEmpty().isLength({ min: 3, max: 150 }),
];

export const validateUpdateProfile = [
  body("username")
    .isLength({ min: 5, max: 30 })
    .custom(checkUsernameUsed)
    .optional(),
  body("firstName").optional().isLength({ min: 3, max: 15 }),
  body("oldPassword").optional().isLength({ min: 6, max: 30 }),
  body("newPassword").optional().isLength({ min: 6, max: 30 }),
  body("lastName").optional().isLength({ min: 3, max: 15 }),
  body("bio").optional().isLength({ min: 0, max: 200 }),
];

export const validateSearch = [query("searchQuery").isString().notEmpty()];
