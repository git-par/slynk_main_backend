import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IEmailOtp {
  _id?: string;
  email: string;
  otp: string;
}

export class EmailOtp implements IEmailOtp {
  _id?: string;
  email: string;
  otp: string;

  constructor(input?: IEmailOtp) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.email = input.email;
    this.otp = input.otp;
  }

  toJSON(): IEmailOtp {
    return omitBy(this, isUndefined) as IEmailOtp;
  }
}
