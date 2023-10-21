import { EmailOtpModal } from "./schema";
import { EmailOtp } from "./types";

/**
 *
 * @param _id
 */
export const deleteEmailOtpById = async (_id: string) => {
  await EmailOtpModal.findByIdAndDelete(_id);
};
