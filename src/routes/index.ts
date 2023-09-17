import { Router } from "express";
import userRouter from "./user.router";
import roomRouter from "./room.router";
import messageRouter from "./messages.router";
import invitationRouter from "./invitation.router";

const router = Router();

router.use("/users/", userRouter);
router.use("/rooms", roomRouter);
router.use("/messages", messageRouter);
router.use("/invitations", invitationRouter);

export default router;
