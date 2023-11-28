import { VirtualBackGroundModal } from "./schema";
import { VirtualBackGround } from "./types";

export const updateVirtualBackGround = async (virtualBackGround: VirtualBackGround) => {
  await VirtualBackGroundModal.findByIdAndUpdate(virtualBackGround._id, virtualBackGround.toJSON());
  return virtualBackGround;
};
