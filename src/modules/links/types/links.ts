import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { ILinksCategory } from "../../linksCategory";

export interface ILinks {
  _id?: string;
  title: string;
  logo: string;
  isPro: boolean;
  isDeactive: boolean;
  prefix?: string;
  androidPrefix?: string;
  iosPrefix?: string;
  suffix?: string;
  placeholder?: string;
  extraLabel?: boolean;
  extraImage?: boolean;
  extraPlaceholder?: string;
  type: string;
  length: number;
  key?: string;
  category: (string | ILinksCategory)[];
  maxLinks: { forFreeUser: number; forPaidUser: number };
  skippedWords: (string)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Links implements ILinks {
  _id?: string;
  title: string;
  logo: string;
  isPro: boolean;
  isDeactive: boolean;
  suffix?: string;
  prefix?: string;
  androidPrefix?: string;
  iosPrefix?: string;
  placeholder?: string;
  extraLabel?: boolean;
  extraImage?: boolean;
  extraPlaceholder?: string;
  type: string;
  length: number;
  key?: string;
  category: (string | ILinksCategory)[];
  maxLinks: { forFreeUser: number; forPaidUser: number };
  skippedWords: (string)[];
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: ILinks) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.title = input.title;
    this.logo = input.logo;
    this.category = input.category;
    this.isPro = !!input.isPro;
    this.isDeactive = !!input.isDeactive;
    this.prefix = input.prefix;
    this.androidPrefix = input.androidPrefix;
    this.iosPrefix = input.iosPrefix;
    this.placeholder = input.placeholder;
    this.extraLabel = input.extraLabel;
    this.extraImage = input.extraImage;
    this.extraPlaceholder = input.extraPlaceholder;
    this.suffix = input.suffix;
    this.type = input.type;
    this.length = input.length;
    this.key = input.key;
    this.maxLinks = input.maxLinks;
    this.skippedWords = input.skippedWords;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  static publicFields = ["_id", "title", "logo", "category", "fileValue", "skippedWords"];

  toJSON(): ILinksCategory {
    return omitBy(this, isUndefined) as ILinksCategory;
  }
}
