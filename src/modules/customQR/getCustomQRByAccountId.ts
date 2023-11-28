import { CustomQRModal } from "./schema";
import { CustomQR } from "./types";

export const getCustomQRByAccountId = async (accountId: string) => {
  const customQR = await CustomQRModal.find({ accountId });
  return customQR.length ? customQR.map((item) => new CustomQR(item)) : null;
};
