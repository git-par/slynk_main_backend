import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";

export interface IPrivateURL {
  _id?: string;
  accountId: IAccount | string;
  privateURL: string;
  ipAddress?: string;
  isQrURL: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PrivateURL implements IPrivateURL {
  _id: string;
  accountId: IAccount | string;
  privateURL: string;
  ipAddress?: string;
  isQrURL: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IPrivateURL) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.privateURL = input.privateURL;
    this.accountId = input.accountId;
    this.ipAddress = input.ipAddress;
    this.isQrURL = input.isQrURL;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IPrivateURL {
    return omitBy(this, isUndefined) as IPrivateURL;
  }
}
