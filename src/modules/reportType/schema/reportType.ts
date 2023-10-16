import { Schema, model } from "mongoose";
import { IReportType } from "..";

const ReportType = new Schema<IReportType>(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ReportTypeModal = model<IReportType>(
  "ReportsType",
  ReportType
);
