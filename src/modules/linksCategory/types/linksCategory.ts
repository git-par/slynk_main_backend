import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { ILinks } from "../../links";

export interface ILinksCategory {
  _id?: string;
  title: string;
  index: number;
  links: (string | ILinks)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class LinkCategory implements ILinksCategory {
  _id?: string;
  title: string;
  index: number;
  links: (string | ILinks)[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ILinksCategory) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.index = input.index;
    this.links = input.links;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ILinksCategory {
    return omitBy(this, isUndefined) as ILinksCategory;
  }
}
