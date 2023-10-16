import { User } from ".";
import { UserModel } from "./schema";
export const getUserByAccountId = async (account: string) => {
  const user = await UserModel.findOne({ accounts: account });
  return user ? new User(user) : null;
};
