import { get, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IImage } from "../../image";

export interface IConnect {
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
  newRequest?: boolean;
  isSlynkUser?: boolean;
  isMutual?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Connect implements IConnect {
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
  newRequest?: boolean;
  isSlynkUser?: boolean;
  isMutual?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IConnect) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.account = Types.ObjectId.isValid(get(input, "account"))
      ? input.account.toString() // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      : // @ts-ignore
        { ...input.account, _id: input.account._id.toString() };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
    this.isMutual = input.isMutual;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.newRequest = input.newRequest;
  }

  toJSON(): IConnect {
    return omitBy(this, isUndefined) as IConnect;
  }
}
