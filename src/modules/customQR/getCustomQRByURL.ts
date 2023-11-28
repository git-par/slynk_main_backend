import { CustomQRModal } from "./schema";
import { CustomQR } from "./types";

export const getCustomQRByURL = async (URL: string) => {
  const customQR = await CustomQRModal.findOne({ URL });
  return customQR ? new CustomQR(customQR) : null;
};
