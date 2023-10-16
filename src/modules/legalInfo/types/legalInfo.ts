import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface ILegalInfo {
  _id?: string;
  title?: string;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LegalInfo implements ILegalInfo
 {
  _id?: string;
  title?: string;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ILegalInfo
    ) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.url = input.url;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ILegalInfo
   {
    return omitBy(this, isUndefined) as ILegalInfo
    ;
  }
}
