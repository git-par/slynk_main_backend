import { PhoneOtp, PhoneOtpModal } from ".";
/**
 *
 * @param phoneOtp
 * @returns
 */

export const savePhoneOtp = async (phoneOtp: PhoneOtp) => {
  const phonesOtp = await new PhoneOtpModal(phoneOtp.toJSON()).save();
  return new PhoneOtp(phonesOtp);
};
