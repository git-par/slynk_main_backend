import { CustomQRModal } from "./schema";
import { CustomQR } from "./types";

export const updateCustomQR = async (customQR: CustomQR) => {
  await CustomQRModal.findByIdAndUpdate(customQR._id, customQR.toJSON());
  return customQR;
};
