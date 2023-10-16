import { model, Schema, Types } from "mongoose";
import { IPassIdentifier } from "../types";

const passIdentifier = new Schema<IPassIdentifier>(
  {
    pkPassId: {
      type: Types.ObjectId,
      ref: "pkPass",
      default: null,
    },
    deviceLibraryIdentifier: {
      type: String,
    },
    passTypeIdentifier: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    passDataJSON: {
      type: String,
    },
    pushToken: {
      type: String,
    },
    isUpdateRequired: {
      type: Boolean,
      default: false,
    },
    lastUpdatedDate: {
      type: String,
      default: (new Date().getTime() / 1000).toString(),
    },
  },
  { timestamps: true }
);

export const PassIdentifierModel = model<IPassIdentifier>(
  "passIdentifier",
  passIdentifier
);
