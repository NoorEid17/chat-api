import { Router } from "express";
import { createNewRoom, fetchRoomInfo } from "../controllers/room.controller";
import auth from "../middlewares/auth";
import checkValidationResult from "../middlewares/checkValidationResult";
import { validateCreateNewRoom } from "../middlewares/room.validation";
const router = Router();

router.post(
  "/",
  auth(),
  validateCreateNewRoom,
  checkValidationResult,
  createNewRoom
);

router.get("/:roomId", fetchRoomInfo);

export default router;
