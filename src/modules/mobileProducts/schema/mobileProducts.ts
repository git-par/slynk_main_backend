import { Schema, model } from "mongoose";
import { IMobileProducts } from "..";
import { deviceType, productName, productType } from "../types";

const mobileProducts = new Schema<IMobileProducts>(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      enum: productName,
    },
    productDesc: {
      type: String,
    },
    platform: {
      type: String,
      enum: deviceType,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    dummyPrice: {
      type: Number,
    },
    productType: {
      type: String,
      enum: productType,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true }
);

export const MobileProductModal = model<IMobileProducts>(
  "mobileProducts",
  mobileProducts
);
