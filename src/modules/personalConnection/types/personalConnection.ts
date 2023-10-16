import { IImage } from "./../../image";
import { IAccount } from "./../../account";
import { isNil, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IPersonalConnection {
  _id?: string;
  profileImage?: string | IImage;
  phone?: string;
  email?: string;
  account: string | IAccount;
  name: string;
  companyName?: string;
  position?: string;
  location?: string;
  slynk?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PersonalConnection implements IPersonalConnection {
  _id?: string;
  profileImage?: string | IImage;
  phone?: string;
  email?: string;
  account: string | IAccount;
  name: string;
  companyName?: string;
  position?: string;
  location?: string;
  slynk?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input: IPersonalConnection) {
    this._id = this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.profileImage = input.profileImage;
    this.phone = input.phone;
    this.email = input.email;
    this.account = input.account;
    this.name = input.name;
    this.companyName = input.companyName;
    this.position = input.position;
    this.location = input.location;
    this.slynk = input.slynk;
    this.instagram = input.instagram;
    this.facebook = input.facebook;
    this.twitter = input.twitter;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IPersonalConnection;
  }

  toComparable(): IPersonalConnection {
    return omitBy(this, isNil) as IPersonalConnection;
  }
}
