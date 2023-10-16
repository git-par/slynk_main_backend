/* eslint-disable no-unused-vars */
import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export enum deviceType {
  ANDROID = "ANDROID",
  IOS = "IOS",
}

export enum productType {
  Original = "ORIGINAL",
  Dummy = "DUMMY",
}

export enum productName {
  Monthly = "MONTHLY",
  Yearly = "YEARLY",
}

export interface IMobileProducts {
  _id?: string;
  productId: string;
  productName: string; // ENUM  Yearly,Monthly
  productDesc: string;
  platform: string; // ENUM  ANDROID, IOS
  originalPrice: number;
  dummyPrice?: number;
  productType?: string; // ENUM  Original,Dummy
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MobileProducts implements IMobileProducts {
  _id?: string;
  productId: string;
  productName: string; // ENUM  Yearly,Monthly
  productDesc: string;
  platform: string; // ENUM  ANDROID, IOS
  originalPrice: number;
  dummyPrice?: number;
  productType?: string; // ENUM  Original,Dummy
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IMobileProducts) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.productId = input.productId;
    this.platform = input.platform;
    this.originalPrice = input.originalPrice;
    this.dummyPrice = input.dummyPrice;
    this.productType = input.productType;
    this.productName = input.productName;
    this.productDesc = input.productDesc;
    this.active = input.active;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IMobileProducts {
    return omitBy(this, isUndefined) as IMobileProducts;
  }
}
