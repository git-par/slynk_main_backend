import { PkPass } from "./types";
import { PkPassModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant pkPass
 */
export const getPkPassById = async (_id: string) => {
  const pkPass = await PkPassModel.findById(_id);
  return pkPass ? new PkPass(pkPass) : null;
};
