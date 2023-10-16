import { Schema, model, Types } from "mongoose";
import { IPromoCode } from "..";

const promoCode = new Schema<IPromoCode>(
    {
        couponId: {
            type: Types.ObjectId,
            ref: "coupons",
        },
        promotionCode: {
            type: String,
        },
        promotionCodeStripeId: {
            type: String,
        },
        active: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
)

export const PromoCodeModal = model<IPromoCode>("promocodes", promoCode);
