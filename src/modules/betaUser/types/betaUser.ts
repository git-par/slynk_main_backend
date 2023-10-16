import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";

export interface IBetaUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  platform: string;
  phoneNumber: string;
  code: string;
  user?: IUser | string;
  deleteRequest?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export class BetaUser implements IBetaUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  platform: string;
  code: string;
  user?: string | IUser;
  deleteRequest?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IBetaUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.email = input.email;
    this.phoneNumber = input.phoneNumber;
    this.platform = input.platform;
    this.deleteRequest = input.deleteRequest;
    this.code = input.code;
    this.user = input.user;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IBetaUser {
    return omitBy(this, isUndefined) as IBetaUser;
  }
}
