import { PhoneOtp, PhoneOtpModal } from ".";

export const getPhoneOtp = async () => {
  const phoneOtp = await PhoneOtpModal.find();
  return phoneOtp ? phoneOtp.map((item) => new PhoneOtp(item)) : null;
};
