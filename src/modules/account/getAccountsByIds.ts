import { Account } from ".";
import { AccountModel } from "./schema";

/**
 * 
 * @param accountIds 
 * @returns 
 */
export const getAccountsByIds = async (accountIds: string[]) => {
  const accounts = await AccountModel.find({ _id: { $in: accountIds } }).lean();
  return accounts.map((ac) => new Account(ac));
};
