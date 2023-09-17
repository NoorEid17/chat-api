import { Router } from "express";
import upload from "../config/multer";
import {
  createNewRoom,
  fetchRoomInfo,
  updateAvatar,
} from "../controllers/room.controller";
import auth from "../middlewares/auth";
import checkValidationResult from "../middlewares/checkValidationResult";
import {
  validateCreateNewRoom,
  validateUpdateAvatar,
} from "../middlewares/room.validation";
const router = Router();

router.post(
  "/",
  auth(),
  validateCreateNewRoom,
  checkValidationResult,
  createNewRoom
);

router.get("/:roomId", fetchRoomInfo);

router.put(
  "/:roomId/update-avatar",
  auth(),
  validateUpdateAvatar,
  checkValidationResult,
  upload.single("avatar"),
  updateAvatar
);

export default router;
