import { VirtualBackGroundModal } from "./schema";
import { VirtualBackGround } from "./types";

export const saveVirtualBackGround = async (virtualBackGround: VirtualBackGround) => {
  await new VirtualBackGroundModal(virtualBackGround.toJSON()).save();
  return virtualBackGround;
};
