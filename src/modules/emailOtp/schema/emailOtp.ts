import { Schema, model } from "mongoose";
import { IEmailOtp } from "..";

const emailOtp = new Schema<IEmailOtp>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
});

export const EmailOtpModal = model<IEmailOtp>("emailOtp", emailOtp);
