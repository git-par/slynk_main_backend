import { PkPass } from "./types";
import { PkPassModel } from "./schema";

/**
 *
 * @returns all pkPass
 */

export const getAllPkPass = async () => {
  const pkPass = await PkPassModel.find();
  return pkPass ? pkPass.map((item) => new PkPass(item)) : null;
};
