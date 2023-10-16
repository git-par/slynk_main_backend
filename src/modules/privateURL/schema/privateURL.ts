import { Schema, model, Types } from "mongoose";
import { IPrivateURL } from "..";
const privateURL = new Schema<IPrivateURL>(
  {
    accountId: {
      type: Types.ObjectId,
      ref: "accounts",
    },
    privateURL: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
    },
    isQrURL: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const PrivateURLModel = model<IPrivateURL>("privateUrl", privateURL);
