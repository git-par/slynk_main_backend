import { IVirtualBackGround } from "../types";
import { Schema, model, Types } from "mongoose";

const virtualBackGround = new Schema<IVirtualBackGround>(
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

export const VirtualBackGroundModal = model<IVirtualBackGround>("virtualBackGround", virtualBackGround);
