import { isArray, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IConnect } from "../../connect";
// import { IPersonalConnection } from "../../personalConnection";

export interface IGroup {
  _id?: string;
  title: string;
  owner: string | IAccount;
  connects?: (string | IConnect)[];
  createdAt?: Date;
  updatedAt?: Date;
  // personalConnection?: (string | IPersonalConnection)[];
}

export class Group implements IGroup {
  _id?: string;
  title: string;
  owner: string | IAccount;
  connects?: (string | IConnect)[];
  createdAt?: Date;
  updatedAt?: Date;

  // personalConnection?: (string | IPersonalConnection)[];
  constructor(input?: IGroup) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.connects = isArray(input.connects) ? input.connects : [];
    this.owner = input.owner;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    // this.personalConnection = isArray(input.personalConnection)
    //   ? input.personalConnection
    //   : [];
  }

  toJSON(): IGroup {
    return omitBy(this, isUndefined) as IGroup;
  }
}
