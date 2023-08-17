import mongoose from "mongoose";

export const connectToDB = (cb: () => void) => {
  mongoose.connect("mongodb://localhost/chat").then(cb);
};
