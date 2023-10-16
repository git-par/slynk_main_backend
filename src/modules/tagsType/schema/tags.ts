import { model, Schema, Types } from "mongoose";
import { ITagType, QRColorType, QRTypeCode } from "../types";

const tag = new Schema<ITagType>({
  size: {
    type: String,
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
  tagImage: {
    type: Types.ObjectId,
    ref: "image",
    default: null,
  },
},{ timestamps: true });

export const TagTypeModel = model<ITagType>("tagsType", tag);
