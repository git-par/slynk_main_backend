import { Schema, model } from "mongoose";
import { IPhoneOtp } from "..";

const phoneOtp = new Schema<IPhoneOtp>({
  phoneNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
});

export const PhoneOtpModal = model<IPhoneOtp>("phonesOtp", phoneOtp);
