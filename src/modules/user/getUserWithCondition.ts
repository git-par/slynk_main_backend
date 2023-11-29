import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @returns User[]
 */
export const getUserWithCondition = async (
  value: object,
  page: number,
  limit: number
) => {
  const users = await UserModel.find(value)
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  console.log(users.length);
  return users.map((user) => new User(user));
};
