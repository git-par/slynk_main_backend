import { LegalInfo,LegalInfoModal } from ".";

/**
 *
 * @param LegalInfo class
 * @returns
 */
export const getLegalInfoById = async (_id: string) => {
  const legalInfo = await LegalInfoModal.findById(_id).lean();
  return legalInfo ? new LegalInfo(legalInfo) : null;
};
