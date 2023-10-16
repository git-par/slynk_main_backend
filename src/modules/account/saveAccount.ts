import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param account
 * @returns return created account
 */
export const saveAccount = async (account: Account) => {
  await new AccountModel(account.toJSON()).save();
  return account;
};
