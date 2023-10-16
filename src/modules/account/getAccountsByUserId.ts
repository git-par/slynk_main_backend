import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param user
 * @returns Account[]
 */
export const getAccountsByUserId = async (user: string) => {
  const accounts = await AccountModel.find({ user }).lean();
  return accounts.map((acc) => new Account(acc));
};
