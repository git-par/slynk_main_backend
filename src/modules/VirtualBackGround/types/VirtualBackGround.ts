import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";

export interface IVirtualBackGround {
  _id?: string;
  accountId: string | IAccount;
  type: string;
  URL: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export class VirtualBackGround implements IVirtualBackGround {
  _id?: string;
  accountId: string | IAccount;
  type: string;
  URL: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IVirtualBackGround) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.accountId = input.accountId;
    this.type = input.type;
    this.URL = input.URL;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON(): IVirtualBackGround {
    return omitBy(this, isUndefined) as IVirtualBackGround;
  }
}
