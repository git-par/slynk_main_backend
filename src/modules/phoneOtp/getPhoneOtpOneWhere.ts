import { PhoneOtpModal } from "./schema";
import { PhoneOtp } from "./types";

export const getPhoneOtpOneWhere = async (where: Record<string, string>) => {
  const phoneOtp = await PhoneOtpModal.findOne(where);
  return phoneOtp ? new PhoneOtp(phoneOtp) : null;
};
