import { PkPass } from "./types";
import { PkPassModel } from "./schema";

/**
 * function for save pkPass in database
 * @param pkPass
 * @returns pkPass itself
 */
export const savePkPassToDb = async (pkPass: PkPass) => {
  await new PkPassModel(pkPass.toJSON()).save();
  return pkPass;
};
