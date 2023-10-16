import { PkPass } from "./types";
import { PkPassModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant pkPass
 */
export const getLatestPkPassByAccountId = async (accountId: string) => {
  const pkPass = await PkPassModel.findOne({ accountId }).sort({ _id: -1 });
  return pkPass ? new PkPass(pkPass) : null;
};
