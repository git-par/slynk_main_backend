import { Schema, model } from "mongoose";
import { IProducts } from "..";

const products = new Schema<IProducts>(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productDesc: {
      type: String,
    },
    productType: {
      type: String,
    },
    priceInterval: {
      type: String,
    },
    discountPrice: {
      type: Number,
    },
    priceIntervalCount: {
      type: Number,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    priceId: {
      type: Object,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export const ProductModal = model<IProducts>("products", products);
