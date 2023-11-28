import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";

export interface ICustomQR {
  _id?: string;
  accountId: string | IAccount;
  type: string;
  URL: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export class CustomQR implements ICustomQR {
  _id?: string;
  accountId: string | IAccount;
  type: string;
  URL: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: ICustomQR) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.accountId = input.accountId;
    this.type = input.type;
    this.URL = input.URL;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON(): ICustomQR {
    return omitBy(this, isUndefined) as ICustomQR;
  }
}
