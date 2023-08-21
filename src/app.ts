require("dotenv").config();
import express from "express";
import cors from "cors";
import { connectToDB } from "./config/mongodb";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import ioServer from "./io";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());

const loggingType = process.env.NODE_ENV ? "dev" : "short";
app.use(morgan(loggingType));

app.use("/api", routes);

connectToDB(() => {
  const httpServer = createServer(app);
  ioServer(httpServer);
  httpServer.listen(process.env.PORT, () => {
    console.log(`Server listening on http://localhost:${process.env.PORT}`);
  });
});
