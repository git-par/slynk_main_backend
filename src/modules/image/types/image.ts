import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
export interface IImage {
  _id?: string;
  description?: string;
  title?: string;
  url?: string;
  mimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Image implements IImage {
  _id?: string;
  description?: string;
  title?: string;
  url?: string;
  mimeType?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IImage) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.description = input.description;
    this.title = input.title;
    this.url = input.url;
    this.mimeType = input.mimeType;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IImage;
  }

  toComparable(): IImage {
    return omitBy(this, isNil) as IImage;
  }
}
