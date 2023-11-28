import { ICustomQR } from "../types";
import { Schema, model, Types } from "mongoose";

const customQR = new Schema<ICustomQR>(
  {
    accountId: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },
    URL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const CustomQRModal = model<ICustomQR>("customQR", customQR);
