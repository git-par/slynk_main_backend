import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface ITutorial {
  _id?: string;
  title?: string;
  embeddedLink?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tutorial implements ITutorial {
  _id?: string;
  title?: string;
  embeddedLink?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ITutorial) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.embeddedLink = input.embeddedLink;
    this.description = input.description;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITutorial {
    return omitBy(this, isUndefined) as ITutorial;
  }
}
