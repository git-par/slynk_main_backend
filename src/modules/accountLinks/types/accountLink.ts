import { isArray, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IImage } from "../../image";
import { ILinks } from "../../links";

export interface IAccountLink {
  _id?: string;
  link: string | ILinks;
  profileShow: boolean;
  cardShow: boolean;
  displayOnTop: boolean;
  value: string;
  fileValue?: string | IImage;
  fileType?: string;
  account: string | IAccount;
  logo: IImage | string;
  label?: string;
  links: { accountLink: string | IAccountLink; show: boolean }[];
  extraTitle?: string;
  extraDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AccountLink implements IAccountLink {
  _id: string;
  link: string | ILinks;
  profileShow: boolean;
  cardShow: boolean;
  displayOnTop: boolean;
  value: string;
  fileValue?: string | IImage;
  fileType?: string;
  account: string | IAccount;
  logo: IImage | string;
  label?: string;
  links: { accountLink: string | IAccountLink; show: boolean }[];
  extraTitle?: string;
  extraDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IAccountLink) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.link = input.link;
    this.profileShow = !!input.profileShow;
    this.cardShow = !!input.cardShow;
    this.displayOnTop = !!input.displayOnTop;
    this.value = input.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.account = Types.ObjectId.isValid(input.account)
      ? input.account.toString()
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { ...input.account, _id: input.account._id.toString() };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.logo = input.logo;
    this.fileValue = input.fileValue;
    this.fileType = input.fileType;
    this.label = input.label;
    this.links = isArray(input.links) ? input.links : [];
    this.extraTitle = input.extraTitle;
    this.extraDescription = input.extraDescription;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IAccountLink {
    return omitBy(this, isUndefined) as IAccountLink;
  }
}
