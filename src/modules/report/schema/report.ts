import { Schema, model, Types } from "mongoose";
import { IReport } from "..";

const report = new Schema<IReport>(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: null,
    },
    reportBy: {
      type: Types.ObjectId,
      ref: "users",
      default: null,
    },
    // reportedUser: {
    //   type: Types.ObjectId,
    //   ref: "users",
    //   default: null,
    // },
    reportedAccount: {
      type: Types.ObjectId,
      ref: "accounts",
      default: null,
    },
  },
  { timestamps: true }
);

export const ReportModal = model<IReport>("report", report);
