import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @returns User[]
 */
export const getUserWithoutDeleteRequest = async () => {
  const users = await UserModel.find({ deleteRequest: false }).sort({
    _id: -1,
  });
  return users.map((user) => new User(user));
};
