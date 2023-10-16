import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IReportType {
  _id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ReportType implements IReportType {
  _id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IReportType) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IReportType {
    return omitBy(this, isUndefined) as IReportType;
  }
}
