import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";

export interface IAnalyticsProfileVisit {
  _id?: string;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  sessionId: string;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  timeSpend: number;
  slynkUser: boolean;
  clickThrow: boolean;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
  // date: Date;
}

export class AnalyticsProfileVisit implements IAnalyticsProfileVisit {
  _id?: string;
  ownerAccountId: string | IAccount;
  visiterAccountId?: string | IAccount;
  sessionId: string;
  remoteIp: string;
  location?: string;
  geoLocation?: object;
  deviceId?: string;
  browserId?: string;
  deviceType?: string;
  browserType?: string;
  timeSpend: number;
  slynkUser: boolean;
  clickThrow: boolean;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
  // date: Date;

  constructor(input?: IAnalyticsProfileVisit) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    // this.date = input.date;
    this.ownerAccountId = input.ownerAccountId;
    this.visiterAccountId = input.visiterAccountId;
    this.sessionId = input.sessionId;
    this.remoteIp = input.remoteIp;
    this.location = input.location;
    this.geoLocation = input.geoLocation;
    this.deviceId = input.deviceId;
    this.browserId = input.browserId;
    this.deviceType = input.deviceType;
    this.browserType = input.browserType;
    this.timeSpend = input.timeSpend;
    this.slynkUser = input.slynkUser;
    this.clickThrow = input.clickThrow;
    this.type = input.type;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IAnalyticsProfileVisit {
    return omitBy(this, isUndefined) as IAnalyticsProfileVisit;
  }
}
