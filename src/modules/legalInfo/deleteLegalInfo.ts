import { LegalInfoModal } from "./schema";

/**
 * @param _id
 * delete LegalInfo by _id
 */
export const deleteLegalInfo = async (_id: string) => {
  await LegalInfoModal.findByIdAndDelete(_id);
};
