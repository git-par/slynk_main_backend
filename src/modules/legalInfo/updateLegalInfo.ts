import { LegalInfoModal } from ".";
import { LegalInfo } from ".";

/**
 *
 * @param LegalInfo class
 * @returns
 */

export const updateLegalInfo = async (legalInfo: LegalInfo) => {
  await LegalInfoModal.findByIdAndUpdate(legalInfo._id, legalInfo.toJSON());
  return legalInfo;
};
