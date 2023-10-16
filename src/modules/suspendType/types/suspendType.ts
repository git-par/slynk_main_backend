import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface ISuspendType {
  _id?: string;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SuspendType implements ISuspendType {
  _id?: string;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ISuspendType) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.reason = input.reason;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ISuspendType {
    return omitBy(this, isUndefined) as ISuspendType;
  }
}
