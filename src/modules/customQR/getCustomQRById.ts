import { CustomQRModal } from "./schema";
import { CustomQR } from "./types";

export const getCustomQRById = async (_id: string) => {
  const customQR = await CustomQRModal.findById(_id);
  return customQR ? new CustomQR(customQR) : null;
};
