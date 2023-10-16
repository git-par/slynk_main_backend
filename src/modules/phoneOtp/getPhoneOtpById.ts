import { PhoneOtp, PhoneOtpModal } from ".";
/**
 *
 * @param phoneOtp id
 * @returns relevant PhoneOtpModal record | null
 */

export const getPhoneOtpById = async (_id: string) => {
  const phoneOtp = await PhoneOtpModal.findById(_id);
  return phoneOtp ? new PhoneOtp(phoneOtp) : null;
};
