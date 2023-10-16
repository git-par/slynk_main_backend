import { model, Schema, Types } from "mongoose";
import { IPersonalConnection } from "..";
import mongooseAutoPopulate from "mongoose-autopopulate";
const personalConnection = new Schema<IPersonalConnection>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    profileImage: {
      type: Types.ObjectId,
      ref: "image",
      autopopulate: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    slynk: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    account: {
      type: Types.ObjectId,
      ref: "accounts",
      autopopulate: false,
    },
  },
  { timestamps: true }
);
personalConnection.plugin(mongooseAutoPopulate);
export const personalConnectionModel = model<IPersonalConnection>(
  "personal_connection",
  personalConnection
);
