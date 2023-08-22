import { Router } from "express";
import { createNewRoom } from "../controllers/room.controller";
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

export default router;
