import { PhoneOtpModal } from "./schema";

/**
 *
 * @param _id
 */
export const deletePhoneOtpById = async (_id: string) => {
  await PhoneOtpModal.findByIdAndDelete(_id);
};
