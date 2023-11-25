import { Schema, model, Types } from "mongoose";
import { ITag, QRColorType, QRTypeCode } from "../types";

const tag = new Schema<ITag>(
  {
    size: {
      type: String,
    },
    password: {
      type: String,
      default: "",
      // required: true,
    },
    color: {
      type: String, // TODO : add enum validation
      enum: QRColorType,
    },
    batchNo: {
      type: String,
    },
    type: {
      type: String, // TODO : add enum validation
      enum: QRTypeCode,
    },
    random: {
      type: String,
      unique: true,
    },
    urlName: {
      type: String,
    },
    account: {
      type: Types.ObjectId,
      ref: "accounts",
    },
    accountLink: {
      type: Types.ObjectId,
      ref: "account_links",
    },
    block: {
      type: Boolean,
      default: false,
    },
    blockMessage: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    tagImage: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    tagGif: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    deleteRequest: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TagModel = model<ITag>("tags", tag);
