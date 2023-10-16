import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IAccountLink } from "../../accountLinks";
import { IAnalyticsProfileVisit } from "../../analyticsProfileVisit";

export interface IAnalyticsLinkVisit {
  _id?: string;
  // date: Date;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  accountLinkId: string | IAccountLink;
  slynkUser: boolean;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  profileVisitId: string | IAnalyticsProfileVisit;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AnalyticsLinkVisit implements IAnalyticsLinkVisit {
  _id?: string;
  // date: Date;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  accountLinkId: string | IAccountLink;
  slynkUser: boolean;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  profileVisitId: string | IAnalyticsProfileVisit;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IAnalyticsLinkVisit) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    // this.date = input.date;
    this.remoteIp = input.remoteIp;
    this.location = input.location;
    this.geoLocation = input.geoLocation;
    this.deviceId = input.deviceId;
    this.browserId = input.browserId;
    this.deviceType = input.deviceType;
    this.browserType = input.browserType;
    this.accountLinkId = input.accountLinkId;
    this.slynkUser = input.slynkUser;
    this.ownerAccountId = input.ownerAccountId;
    this.visiterAccountId = input.visiterAccountId;
    this.profileVisitId = input.profileVisitId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IAnalyticsLinkVisit {
    return omitBy(this, isUndefined) as IAnalyticsLinkVisit;
  }
}
