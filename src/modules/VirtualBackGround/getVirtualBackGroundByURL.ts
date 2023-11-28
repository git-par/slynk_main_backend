import { VirtualBackGroundModal } from "./schema";
import { VirtualBackGround } from "./types";

export const getVirtualBackGroundByURL = async (URL: string) => {
  const virtualBackGround = await VirtualBackGroundModal.findOne({ URL });
  return virtualBackGround ? new VirtualBackGround(virtualBackGround) : null;
};
