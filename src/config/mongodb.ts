import mongoose from "mongoose";

export const connectToDB = (cb: () => void) => {
  mongoose
    .connect(process.env.MONGO_URL || "mongodb://localhost/chat")
    .then(cb);
};
