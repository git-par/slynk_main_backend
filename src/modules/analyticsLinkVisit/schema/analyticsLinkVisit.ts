import { Schema, model, Types } from "mongoose";
import { IAnalyticsLinkVisit } from "..";

const analyticsLinkVisit = new Schema<IAnalyticsLinkVisit>(
  {
    remoteIp: {
      type: String,
    },
    location: {
      type: String,
    },
    geoLocation: {
      type: Object ,
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
    accountLinkId: {
      type: Types.ObjectId,
      ref: "account_links",
      default: null,
    },
    slynkUser: {
      type: Boolean,
      default: false,
    },
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
    profileVisitId: {
      type: Types.ObjectId,
      ref: "accounts",
      default: null,
    },
  },
  { timestamps: true }
);

export const AnalyticsLinkVisitModal = model<IAnalyticsLinkVisit>(
  "analyticsLinkVisit",
  analyticsLinkVisit
);
