import { VirtualBackGroundModal } from "./schema";

export const deleteVirtualBackGround = async (_id: string) => {
  await VirtualBackGroundModal.findByIdAndDelete(_id);
};
