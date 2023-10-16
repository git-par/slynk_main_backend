import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IFaq {
  _id?: string;
  title?: string;
  embeddedLink?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Faq implements IFaq {
  _id?: string;
  title?: string;
  embeddedLink?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IFaq) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.embeddedLink = input.embeddedLink;
    this.description = input.description;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IFaq {
    return omitBy(this, isUndefined) as IFaq;
  }
}
