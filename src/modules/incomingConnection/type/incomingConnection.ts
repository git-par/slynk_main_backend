import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IImage } from "../../image";

export interface IIncomingConnection {
  _id?: string;
  account: string | IAccount;
  targetAccount: { account: IAccount | string; show: boolean };
  userData: { label: string; value: string }[];
  image?: IImage | string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  companyName?: string;
  role?: string;
  isSlynkUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  newRequest?: boolean;
}

export class IncomingConnection implements IIncomingConnection {
  _id?: string;
  account: string | IAccount;
  targetAccount: { account: IAccount | string; show: boolean };
  userData: { label: string; value: string }[];
  image?: IImage | string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  companyName?: string;
  role?: string;
  isSlynkUser?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  newRequest?: boolean;

  constructor(input?: IIncomingConnection) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
      this.account = input.account
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ? Types.ObjectId.isValid(input.account)
        ? input.account.toString()
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          { ...input.account, _id: input.account?._id?.toString() }
      : null;
    this.targetAccount = input.targetAccount;
    this.userData = input.userData;
    this.image = input.image;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.phoneNumber = input.phoneNumber;
    this.email = input.email;
    this.companyName = input.companyName;
    this.role = input.role;
    this.isSlynkUser = input.isSlynkUser;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.newRequest = input.newRequest;
  }

  toJSON(): IIncomingConnection {
    return omitBy(this, isUndefined) as IIncomingConnection;
  }
}
