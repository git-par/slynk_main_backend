import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IMobileProducts } from "../../mobileProducts";

export interface IMobileCoupons {
  _id?: string;
  couponCode: string;
  expDate?: Date;
  discount: number;
  mobileProductId: (string | IMobileProducts)[];
  maxRedemptions?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MobileCoupon implements IMobileCoupons {
  _id?: string;
  couponCode: string;
  expDate?: Date;
  discount: number;
  mobileProductId: (string | IMobileProducts)[];
  maxRedemptions?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IMobileCoupons) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.couponCode = input.couponCode;
    this.expDate = input.expDate;
    this.discount = input.discount;
    this.mobileProductId = input.mobileProductId;
    this.maxRedemptions = input.maxRedemptions;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IMobileCoupons {
    return omitBy(this, isUndefined) as IMobileCoupons;
  }
}
