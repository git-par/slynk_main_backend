import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IPromoCode } from "../../promoCode";

export interface ICoupons {
    _id?: string;
    couponId: string;
    couponName: string;
    discountDuration: string; // ENUM
    discountDurationInMonth?: number;
    discountType: string; // ENUM
    discountOff: number;
    maxRedemptions?: number;
    redemptionsTill?: number;
    promotionCode: (string | IPromoCode)[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class Coupon implements ICoupons {
    _id?: string;
    couponId: string;
    couponName: string;
    discountDuration: string;
    discountDurationInMonth?: number;
    discountType: string;
    discountOff: number;
    maxRedemptions?: number;
    redemptionsTill?: number;
    promotionCode: (string | IPromoCode)[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(input?: ICoupons) {
        this._id = input._id
            ? input._id.toString()
            : new Types.ObjectId().toString();
        this.couponId = input.couponId
        this.couponName = input.couponName
        this.discountDuration = input.discountDuration
        this.discountDurationInMonth = input.discountDurationInMonth
        this.discountType = input.discountType
        this.discountOff = input.discountOff
        this.maxRedemptions = input.maxRedemptions
        this.redemptionsTill = input.redemptionsTill
        this.promotionCode = input.promotionCode
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;
    }

    toJSON(): ICoupons {
        return omitBy(this, isUndefined) as ICoupons;
    }
}