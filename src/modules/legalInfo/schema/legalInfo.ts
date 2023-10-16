import { Schema, model } from "mongoose";
import { ILegalInfo } from "..";

const legalInfo = new Schema<ILegalInfo>(
  {
    title: {
      type: String,
      default: "",
    },
    url: {
      type: String,    
      default: null,
    },
  },
  { timestamps: true }
);

export const LegalInfoModal = model<ILegalInfo>("legalInfo", legalInfo);
