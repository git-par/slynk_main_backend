import mongoose from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

export const connectDb = () => {
  return mongoose.plugin(mongooseAutoPopulate).connect(process.env.DB_URL, {
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  });
};
