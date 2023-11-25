import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @returns User[]
 */
export const getUserWithDeleteRequest = async () => {
  const users = await UserModel.find({ deleteRequest: true }).sort({ _id: -1 });
  return users.map((user) => new User(user));
};
