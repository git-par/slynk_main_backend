import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IProducts {
  _id?: string;
  productId: string;
  productName: string;
  productDesc: string;
  productType: string;
  priceInterval: string;
  currentPrice: number;
  discountPrice?: number;
  priceIntervalCount: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  priceId: any;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Products implements IProducts {
  _id?: string;
  productId: string;
  productName: string;
  productType: string;
  productDesc: string;
  priceInterval: string;
  currentPrice: number;
  discountPrice?: number;
  priceIntervalCount: number;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  priceId: any;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IProducts) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.productId = input.productId;
    this.productName = input.productName;
    this.productDesc = input.productDesc;
    this.productType = input.productType;
    this.priceInterval = input.priceInterval;
    this.currentPrice = input.currentPrice;
    this.priceIntervalCount = input.priceIntervalCount;
    this.discountPrice = input.discountPrice;
    this.currentPrice = input.currentPrice;
    this.priceId = input.priceId;
    this.active = input.active;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IProducts {
    return omitBy(this, isUndefined) as IProducts;
  }
}
