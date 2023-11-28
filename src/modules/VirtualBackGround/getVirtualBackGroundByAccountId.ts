import { VirtualBackGroundModal } from "./schema";
import { VirtualBackGround } from "./types";

export const getVirtualBackGroundByAccountId = async (accountId: string) => {
  const virtualBackGround = await VirtualBackGroundModal.find({ accountId });
  return virtualBackGround.length ? virtualBackGround.map((item) => new VirtualBackGround(item)) : null;
};
