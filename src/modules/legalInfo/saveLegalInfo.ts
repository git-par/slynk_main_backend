import { LegalInfo } from ".";
import { LegalInfoModal } from "./schema";

/**
 *
 * @param LegalInfo LegalInfo class
 * @returns created LegalInfo
 */
export const saveLegalInfo = async (legalInfo: LegalInfo) => {
  await new LegalInfoModal(legalInfo.toJSON()).save();
  return legalInfo;
};
