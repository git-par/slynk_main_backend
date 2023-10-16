import { Schema, model, Types } from "mongoose";
import { ICoupons } from "..";

const coupons = new Schema<ICoupons>(
    {
        couponId: {
            type: String,
        },
        couponName: {
            type: String,
        },
        discountDuration: {
            type: String,
        },
        discountDurationInMonth: {
            type: Number,
        },
        discountType: {
            type: String,
        },
        discountOff: {
            type: Number,
        },
        maxRedemptions: {
            type: Number,
        },
        redemptionsTill: {
            type: Number,
        },
        promotionCode: [{
            type: Types.ObjectId,
            ref: "promocodes",
        }],
    },
    { timestamps: true }
)

export const CouponModal = model<ICoupons>("coupons", coupons);
