import { CustomQRModal } from "./schema";

export const deleteCustomQR = async (_id: string) => {
  await CustomQRModal.findByIdAndDelete(_id);
};
