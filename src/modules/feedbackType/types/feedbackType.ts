import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IFeedBackType {
  _id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeedBackType implements IFeedBackType {
  _id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IFeedBackType) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IFeedBackType {
    return omitBy(this, isUndefined) as IFeedBackType;
  }
}
