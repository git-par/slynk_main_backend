import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IPhoneOtp {
  _id?: string;
  phoneNumber: string;
  otp: string;
}

export class PhoneOtp implements IPhoneOtp {
  _id?: string;
  phoneNumber: string;
  otp: string;

  constructor(input?: IPhoneOtp) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.phoneNumber = input.phoneNumber;
    this.otp = input.otp;
  }

  toJSON(): IPhoneOtp {
    return omitBy(this, isUndefined) as IPhoneOtp;
  }
}
