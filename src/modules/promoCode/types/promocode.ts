import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { ICoupons } from "../../coupons";

export interface IPromoCode {
    _id?: string;
    couponId: (string | ICoupons);
    promotionCode: string;
    promotionCodeStripeId: string;
    active: boolean;
}

export class PromoCode implements IPromoCode {
    _id?: string;
    couponId: (string | ICoupons);
    promotionCode: string;
    promotionCodeStripeId: string;
    active: boolean;

    constructor(input?: IPromoCode) {
        this._id = input._id
            ? input._id.toString()
            : new Types.ObjectId().toString();
        this.couponId = input.couponId
        this.promotionCode = input.promotionCode
        this.promotionCodeStripeId = input.promotionCodeStripeId
        this.active = input.active

    }

    toJSON(): IPromoCode {
        return omitBy(this, isUndefined) as IPromoCode;
    }
}