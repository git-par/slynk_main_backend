import { Twilio } from "twilio";

export const sendOtpMsg = ({ to, otp }) => {
  const twilio = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    { lazyLoading: true }
  );
  return twilio.messages.create({
    body: `${otp} is your slynk verification code. Do not share it with anyone.`,
    from: process.env.TWILIO_PHONE_NO,
    to,
  });
};
