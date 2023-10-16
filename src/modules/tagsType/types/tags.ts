/* eslint-disable no-unused-vars */
import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IImage } from "../../image";

export enum QRColorType {
  BLACK = "BK",
  WHITE = "WT",
  HOLOGRAM = "HG",
  QRDESIGN = "QR",
  MATTEBLACK = "MBK",
  MATTEWHITE = "MWT",
  MATTEHOLOGRAM = "MHG",
}

export enum QRTypeCode {
  PVCCARDS = "PC",
  METALCARDS = "MC",
  BLANKMETALCARDS = "BMC",
  ROUNDEPOXY = "RE",
  SQUAREEPOXY = "SE",
}
export interface ITagType {
  _id?: string;
  size?: string;
  color?: string;
  batchNo?: string;
  type?: string;
  tagImage?: IImage | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TagType implements ITagType {
  _id?: string;
  size?: string;
  color?: string;
  batchNo?: string;
  type?: string;
  tagImage?: IImage | string;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: ITagType) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.size = input.size;
    this.color = input.color;
    this.batchNo = input.batchNo;
    this.type = input.type;
    this.tagImage = input.tagImage;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITagType {
    return omitBy(this, isUndefined) as ITagType;
  }
}
