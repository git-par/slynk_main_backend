import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IUser } from "../../user";

export interface IReport {
  _id?: string;
  title?: string;
  description?: string;
  reportBy: string | IUser;
  // reportedUser: string | IUser;
  reportedAccount: string | IAccount;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Report implements IReport {
  _id?: string;
  title?: string;
  description?: string;
  reportBy: string | IUser;
  // reportedUser: string | IUser;
  reportedAccount: string | IAccount;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IReport) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.description = input.description;
    this.reportBy = input.reportBy;
    // this.reportedUser = input.reportedUser;
    this.reportedAccount = input.reportedAccount;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IReport {
    return omitBy(this, isUndefined) as IReport;
  }
}
