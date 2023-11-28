import { VirtualBackGroundModal } from "./schema";
import { VirtualBackGround } from "./types";

export const getVirtualBackGroundById = async (_id: string) => {
  const virtualBackGround = await VirtualBackGroundModal.findById(_id);
  return virtualBackGround ? new VirtualBackGround(virtualBackGround) : null;
};
