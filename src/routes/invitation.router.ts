import { Router } from "express";
import * as InvitationController from "../controllers/Invitation.controller";
import auth from "../middlewares/auth";
import checkValidationResult from "../middlewares/checkValidationResult";
import {
  validateCreateInvitation,
  validateUpdateInvitation,
} from "../middlewares/invitation.validation";

const router = Router();

router.post(
  "/",
  auth(),
  validateCreateInvitation,
  checkValidationResult,
  InvitationController.create
);

router.get("/", auth(), InvitationController.getReceivedPendingInvitations);

router.put(
  "/:invitationId/accept",
  auth(),
  validateUpdateInvitation,
  InvitationController.accept
);

router.delete(
  "/:invitationId/reject",
  auth(),
  validateUpdateInvitation,
  InvitationController.accept
);

export default router;
