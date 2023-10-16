import { User } from ".";
import { UserModel } from "./schema";
export const getUserByBetaUserId = async (betaUser: string) => {
  const user = await UserModel.findOne({ betaUser: betaUser });
  return user ? new User(user) : null;
};
