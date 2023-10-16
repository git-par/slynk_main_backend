import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param accountName account name
 * @returns accounts[]
 */
export const getAccountsByAccountName = async (accountName: string) => {
  const accounts = await AccountModel.find({
    accountName: { $regex: new RegExp(`^${accountName}$`), $options: "i" },
  });
  return accounts.map((account) => new Account(account));
};
