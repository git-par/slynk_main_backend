/* eslint-disable no-unused-vars */
import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IPkPass } from "../../pkPass";

export interface IPassIdentifier {
  _id?: string;
  pkPassId: string | IPkPass;
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  passDataJSON?: string;
  pushToken?: string;
  isUpdateRequired?: boolean;
  lastUpdatedDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PassIdentifier implements IPassIdentifier {
  _id?: string;
  pkPassId: string | IPkPass;
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  passDataJSON?: string;
  pushToken?: string;
  isUpdateRequired?: boolean;
  lastUpdatedDate?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IPassIdentifier) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.pkPassId = input.pkPassId;
    this.deviceLibraryIdentifier = input.deviceLibraryIdentifier;
    this.passTypeIdentifier = input.passTypeIdentifier;
    this.serialNumber = input.serialNumber;
    this.passDataJSON = input.passDataJSON;
    this.pushToken = input.pushToken;
    this.isUpdateRequired = input.isUpdateRequired;
    this.lastUpdatedDate = input.lastUpdatedDate;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IPassIdentifier {
    return omitBy(this, isUndefined) as IPassIdentifier;
  }
}
