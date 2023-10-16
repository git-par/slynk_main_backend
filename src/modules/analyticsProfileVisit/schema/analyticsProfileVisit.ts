import { Schema, model, Types } from "mongoose";
import { IAnalyticsProfileVisit } from "..";

const analyticsProfileVisit = new Schema<IAnalyticsProfileVisit>(
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
    sessionId: {
      type: String,
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
    timeSpend: {
      type: Number,
    },
    slynkUser: {
      type: Boolean,
      default: false,
    },
    clickThrow: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

export const AnalyticsProfileVisitModal = model<IAnalyticsProfileVisit>(
  "analyticsProfileVisit",
  analyticsProfileVisit
);
