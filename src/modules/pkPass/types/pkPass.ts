import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
export interface IPkPass {
  _id?: string;
  accountId: string | IAccount;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PkPass implements IPkPass {
  _id?: string;
  accountId: string | IAccount;
  url: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IPkPass) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.accountId = input.accountId;
    this.url = input.url;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IPkPass;
  }

  toComparable(): IPkPass {
    return omitBy(this, isNil) as IPkPass;
  }
}
