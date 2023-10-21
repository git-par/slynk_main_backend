import { EmailOtpModal } from "./schema";
import { EmailOtp } from "./types";

export const getEmailOtpOneWhere = async (where: Record<string, string>) => {
  const emailOtp = await EmailOtpModal.findOne(where);
  return emailOtp ? new EmailOtp(emailOtp) : null;
};
