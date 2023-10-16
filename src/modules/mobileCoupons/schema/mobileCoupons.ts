import { Schema, model, Types } from "mongoose";
import { IMobileCoupons } from "..";

const mobileCoupons = new Schema<IMobileCoupons>(
  {
    couponCode: {
      type: String,
    },
    expDate: {
      type: Date,
    },
    discount: {
      type: Number,
    },
    mobileProductId: [
      {
        type: Types.ObjectId,
        ref: "mobileProducts",
        default: null,
      },
    ],
    maxRedemptions: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const MobileCouponModal = model<IMobileCoupons>(
  "mobileCoupons",
  mobileCoupons
);
