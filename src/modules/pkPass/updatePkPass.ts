import { PkPass } from "./types";
import { PkPassModel } from "./schema";

/**
 * 
 * @param pkpass 
 * @returns 
 */

export const updatePkPass = async (pkpass: PkPass) => {
  await PkPassModel.findByIdAndUpdate(pkpass._id, pkpass.toJSON());
  return pkpass;
};
