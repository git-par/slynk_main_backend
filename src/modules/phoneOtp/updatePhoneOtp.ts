import { PhoneOtp, PhoneOtpModal } from ".";
/**
 *
 * @param PhoneOtp class
 * @returns updated phoneotp record
 */

export const updatePhoneOtp = async (phoneOtp: PhoneOtp) => {
  await PhoneOtpModal.findByIdAndUpdate(phoneOtp._id, phoneOtp.toJSON());
  return phoneOtp;
};
