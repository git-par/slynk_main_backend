import { Schema, model, Types } from "mongoose";
import { IAnalyticsContactCount } from "..";

const analyticsContactCount = new Schema<IAnalyticsContactCount>(
  {
    ownerAccountId: {
      type: Types.ObjectId,
      ref: "accounts",
      default: null,
    },
    visiterAccountId: {
      type: Types.ObjectId,
      ref: "accounts",
      default: null,
    },
    remoteIp: {
      type: String,
    },
    location: {
      type: String,
    },
    geoLocation: {
      type: Object,
    },
    deviceId: {
      type: String,
    },
    browserId: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    browserType: {
      type: String,
    },
    slynkUser: {
      type: Boolean,
      default: false,
    },
    profileVisitId: {
      type: Types.ObjectId,
      ref: "accounts",
      default: null,
    },
  },
  { timestamps: true }
);

export const AnalyticsContactCountModal = model<IAnalyticsContactCount>(
  "analyticsContactCount",
  analyticsContactCount
);
