import { BetaUser } from ".";
import { BetaUserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
export const getBetaUserById = async (_id: string) => {
  const user = await BetaUserModel.findById(_id);
  return user ? new BetaUser(user) : null;
};
