import { EmailOtp, EmailOtpModal } from ".";
/**
 *
 * @param emailOtp
 * @returns
 */

export const saveEmailOtp = async (emailOtp: EmailOtp) => {
  const phonesOtp = await new EmailOtpModal(emailOtp.toJSON()).save();
  return new EmailOtp(phonesOtp);
};
