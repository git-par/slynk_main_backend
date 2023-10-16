import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param RESETToken
 * @returns relevant user record | null
 */
export const getUserByResetToken = async (RESETToken: string) => {
  const user = await UserModel.findOne({ RESETToken: RESETToken });
  return user ? new User(user) : null;
};
