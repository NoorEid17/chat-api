require("dotenv").config();
import express from "express";
import cors from "cors";
import { connectToDB } from "./config/mongodb";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import ioServerHandler from "./io";
import routes from "./routes";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "localhost",
    credentials: true,
  })
);

const loggingType = process.env.NODE_ENV ? "dev" : "short";
app.use(morgan(loggingType));

app.use("/api", routes);

const httpServer = createServer(app);

export const ioServer: Server = ioServerHandler(httpServer);

connectToDB(() => {
  httpServer.listen(
    { host: process.env.HOST || "localhost", port: process.env.PORT || 5000 },
    () => {
      console.log(
        `Server listening on http://${process.env.HOST || "localhost"}:${
          process.env.PORT
        }`
      );
    }
  );
});
