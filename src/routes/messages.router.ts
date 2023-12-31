import { Router } from "express";
import { validateGetMessages } from "../middlewares/message.validation";
import * as MessageController from "../controllers/message.controller";
import auth from "../middlewares/auth";

const router = Router();

router.get(
  "/:roomId",
  auth(),
  validateGetMessages,
  MessageController.getMessages
);

router.get(
  "/:roomId/unread",
  auth(),
  validateGetMessages,
  MessageController.getUnreadMessages
);

export default router;
