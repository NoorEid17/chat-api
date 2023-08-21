import { Router } from "express";
import {
  validateLogin,
  validateSignup,
  validateUpdateProfile,
} from "../middlewares/user.validation";
import checKValidatioResults from "../middlewares/checkValidationResult";
import * as UserController from "../controllers/user.controller";
import auth from "../middlewares/auth";
import upload from "../config/multer";
const router = Router();

router.post(
  "/signup",
  validateSignup,
  checKValidatioResults,
  UserController.signup
);

router.post("/login", validateLogin, UserController.login);

router.post("/token", UserController.refreshToken);

router.patch(
  "/",
  auth(),
  upload.single("avatar"),
  validateUpdateProfile,
  checKValidatioResults,
  UserController.update
);

export default router;
