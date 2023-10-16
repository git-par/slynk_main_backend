import { User } from ".";
import { UserModel } from "./schema";

/**
 * 
 * 
 * @returns user record | null
 */
export const getUserByToken = async (_id: string) => {
  const user = await UserModel.findById(_id);
  return user ? new User(user) : null;
};
