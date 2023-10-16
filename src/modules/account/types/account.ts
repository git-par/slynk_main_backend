import { isArray, isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccountLink } from "../../accountLinks";
import { IImage } from "../../image";
// import { IPersonalConnection } from "../../personalConnection";
import { IUser } from "../../user";

export interface IAccount {
  _id?: string;
  firstName?: string;
  lastName?: string;
  type: string;
  user: IUser | string;
  profileImage?: IImage | string;
  qrImage?: IImage | string;
  qrColor?: string;
  logo?: IImage | string;
  companyName?: string;
  role?: string;
  location?: string;
  city?: string;
  state?: string;
  links: (string | IAccountLink)[];
  direct: boolean;
  isPrivate: boolean;
  rsb?: string;
  ls?: string;
  background?: string;
  backgroundImage?: IImage | string;
  fc?: string;
  aboutMe?: string;
  darkMode?: boolean;
  accountName?: string;
  isDeleted: boolean;
  views: number;
  recentColor?: string[];
  isDiscoverable?: boolean;
  isVerify?: boolean;
  qrBg?: string;
  isArchive?: boolean;
  googleWalletPicId?: IImage | string;
  dragOff?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // personalConnection: (string | IPersonalConnection)[];
}

export class Account implements IAccount {
  _id?: string;
  firstName?: string;
  lastName?: string;
  type: string;
  user: string | IUser;
  profileImage?: string | IImage;
  qrImage?: string | IImage;
  qrColor?: string;
  logo?: string | IImage;
  companyName?: string;
  role?: string;
  location?: string;
  city?: string;
  state?: string;
  links: (string | IAccountLink)[];
  direct: boolean;
  isPrivate: boolean;
  rsb?: string;
  ls?: string;
  background?: string;
  backgroundImage?: IImage | string;
  fc?: string;
  aboutMe?: string;
  darkMode?: boolean;
  accountName?: string;
  isDeleted: boolean;
  views: number;
  recentColor?: string[];
  isDiscoverable?: boolean;
  isVerify?: boolean;
  qrBg?: string;
  isArchive?: boolean;
  googleWalletPicId?: IImage | string;
  dragOff?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // personalConnection: (string | IPersonalConnection)[];
  constructor(input?: IAccount) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.type = input.type;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.user = Types.ObjectId.isValid(input.user)
      ? input.user.toString()
      : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { ...input.user, _id: input.user._id.toString() };
    this.profileImage = input.profileImage;
    this.qrColor = input.qrColor;
    this.qrImage = input.qrImage;
    this.logo = input.logo;
    this.companyName = input.companyName;
    this.role = input.role;
    this.location = input.location;
    this.city = input.city;
    this.state = input.state;
    this.links = isArray(input.links) ? input.links : [];
    this.direct = !!input.direct;
    this.isPrivate = input.isPrivate;
    this.rsb = input.rsb;
    this.ls = input.ls;
    this.background = input.background;
    this.backgroundImage = input.backgroundImage;
    this.fc = input.fc;
    this.aboutMe = input.aboutMe;
    this.darkMode = input.darkMode;
    this.accountName = input.accountName;
    this.recentColor = input.recentColor;
    this.isDeleted = !!input.isDeleted;
    this.views = input.views || 0;
    this.isDiscoverable = input.isDiscoverable;
    this.isVerify = input.isVerify;
    this.qrBg = input.qrBg;
    this.isArchive = input.isArchive;
    this.googleWalletPicId = input.googleWalletPicId;
    this.dragOff = input.dragOff;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  static defaults = {
    direct: false,
    links: [],
    profileImage: null,
    isPrivate: false,
    darkMode: false,
    views: 0,
    type: "PERSONAL",
  };

  static publicFields = [
    "_id",
    "firstName",
    "lastName",
    "profileImage",
    "qrImage",
    "qrColor",
    "companyName",
    "role",
    "location",
    "links",
    "direct",
    "personalConnection",
    "isPrivate",
    "rsb",
    "ls",
    "background",
    "fc",
    "accountName",
    "aboutMe",
    "type",
    "logo",
    "isArchive",
  ];

  static shortFields = [
    "_id",
    "firstName",
    "lastName",
    "role",
    "companyName",
    "profileImage",
    "qrImage",
    "qrColor",
    "aboutMe",
    "accountName",
    "type",
    "isVerify",
    "isArchive",
    "user",
  ];

  static searchUserFields = [
    "_id",
    "firstName",
    "lastName",
    "profileImage",
    "aboutMe",
    "accountName",
    "companyName",
    "role",
    "isVerify",
    "isArchive",
  ];
  static QrFields = ["_id", "qrImage", "qrColor", "accountName"];
  static feedBackFields = [
    "_id",
    "firstName",
    "lastName",
    "companyName",
    "type",
  ];

  toJSON(): IAccount {
    return omitBy(this, isUndefined) as IAccount;
  }
}
