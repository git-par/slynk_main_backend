import { LegalInfoModal } from ".";
import { LegalInfo } from ".";

export const getLegalInfo = async () => {
  const legalInfo = await LegalInfoModal.find().lean();
  return legalInfo ? legalInfo.map((item) => new LegalInfo(item)) : null;
};
