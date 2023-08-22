import { Router } from "express";
import userRouter from "./user.router";
import roomRouter from "./room.router";

const router = Router();

router.use("/users/", userRouter);

router.use("/rooms", roomRouter);

export default router;
