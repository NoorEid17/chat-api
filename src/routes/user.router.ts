import { Router } from "express";
import {
  validateAddContact,
  validateLogin,
  validateSearch,
  validateSignup,
  validateUpdateProfile,
} from "../middlewares/user.validation";
import checkValidationResult from "../middlewares/checkValidationResult";
import * as UserController from "../controllers/user.controller";
import auth from "../middlewares/auth";
import upload from "../config/multer";
const router = Router();

router.post("/logout", UserController.logout);

router.post(
  "/signup",
  validateSignup,
  checkValidationResult,
  UserController.signup
);

router.post("/login", validateLogin, UserController.login);

router.post("/token", UserController.refreshToken);

router.patch(
  "/",
  auth(),
  upload.single("avatar"),
  validateUpdateProfile,
  checkValidationResult,
  UserController.update
);

router.get("/rooms", auth(), UserController.getRooms);

router.get("/contacts", auth(), UserController.getContacts);

router.post("/search", validateSearch, UserController.search);

router.post("/contact", auth(), validateAddContact, UserController.addContact);

export default router;
