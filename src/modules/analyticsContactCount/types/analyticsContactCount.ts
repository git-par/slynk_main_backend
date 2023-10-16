import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IAnalyticsProfileVisit } from "../../analyticsProfileVisit";

export interface IAnalyticsContactCount {
  _id?: string;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  slynkUser: boolean;
  profileVisitId: string | IAnalyticsProfileVisit;
  createdAt?: Date;
  updatedAt?: Date;
  // date: Date;
}

export class AnalyticsContactCount implements IAnalyticsContactCount {
  _id?: string;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  slynkUser: boolean;
  profileVisitId: string | IAnalyticsProfileVisit;
  createdAt?: Date;
  updatedAt?: Date;
  // date: Date;

  constructor(input?: IAnalyticsContactCount) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    // this.date = input.date;
    this.ownerAccountId = input.ownerAccountId;
    this.visiterAccountId = input.visiterAccountId;
    this.remoteIp = input.remoteIp;
    this.location = input.location;
    this.geoLocation = input.geoLocation;
    this.deviceId = input.deviceId;
    this.browserId = input.browserId;
    this.deviceType = input.deviceType;
    this.browserType = input.browserType;
    this.slynkUser = input.slynkUser;
    this.profileVisitId = input.profileVisitId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IAnalyticsContactCount {
    return omitBy(this, isUndefined) as IAnalyticsContactCount;
  }
}
