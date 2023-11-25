/* eslint-disable no-unused-vars */
import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account/types/account";
import { IAccountLink } from "../../accountLinks";
import { IImage } from "../../image";

export enum QRColorType {
  BLACK = "BK",
  WHITE = "WT",
  HOLOGRAM = "HG",
  QRDESIGN = "QR",
  MATTEBLACK = "MBK",
  MATTEWHITE = "MWT",
  MATTEHOLOGRAM = "MHG",
  CUSTOMCARD = "CC",
}

export enum QRTypeCode {
  PVCCARDS = "PC",
  METALCARDS = "MC",
  BLANKMETALCARDS = "BMC",
  ROUNDEPOXY = "RE",
  SQUAREEPOXY = "SE",
  SQUARETAGPLASTIC = "ST",
  ROUNDTAGPLASTIC = "RT",
  CUSTOMCARD = "CC",
}
export interface ITag {
  _id?: string;
  password?: string;
  size?: string;
  color?: string;
  batchNo?: string;
  type?: string;
  random?: string;
  urlName?: string;
  account?: (string | IAccount)[];
  accountLink?: (string | IAccountLink)[];
  block?: boolean;
  label?: string;
  blockMessage?: string;
  tagImage?: IImage | string;
  tagGif?: IImage | string;
  deleteRequest?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TagDefaults {
  block: false;
}

export class Tag implements ITag {
  _id?: string;
  password?: string;
  size?: string;
  color?: string;
  batchNo?: string;
  type?: string;
  random?: string;
  urlName?: string;
  account?: (string | IAccount)[];
  accountLink?: (string | IAccountLink)[];
  block = false;
  blockMessage?: string;
  label?: string;
  tagImage?: IImage | string;
  tagGif?: IImage | string;
  deleteRequest?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ITag) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.password = input.password;
    this.size = input.size;
    this.color = input.color;
    this.batchNo = input.batchNo;
    this.type = input.type;
    this.random = input.random;
    this.urlName = input.urlName;
    this.account = input.account;
    this.accountLink = input.accountLink;
    this.blockMessage = input.blockMessage;
    this.block = input.block;
    this.label = input.label;
    this.tagImage = input.tagImage;
    this.tagGif = input.tagGif;
    this.deleteRequest = input.deleteRequest;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  static defaults: TagDefaults = {
    block: false,
  };

  toJSON(): ITag {
    return omitBy(this, isUndefined) as ITag;
  }
}
