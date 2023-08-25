import { Router } from "express";
import userRouter from "./user.router";
import roomRouter from "./room.router";
import messageRouter from "./messages.router";

const router = Router();

router.use("/users/", userRouter);
router.use("/rooms", roomRouter);
router.use("/messages", messageRouter);

export default router;
