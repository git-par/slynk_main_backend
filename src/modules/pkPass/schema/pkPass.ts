import { model, Schema, Types } from "mongoose";
import { IPkPass } from "../types";
const pkPass = new Schema<IPkPass>(
  {
    accountId: {
      type: Types.ObjectId,
      red: "accounts",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const PkPassModel = model<IPkPass>("pkPass", pkPass);
