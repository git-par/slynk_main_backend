import { CustomQRModal } from "./schema";
import { CustomQR } from "./types";

export const saveCustomQR = async (customQR: CustomQR) => {
  await new CustomQRModal(customQR.toJSON()).save();
  return customQR;
};
