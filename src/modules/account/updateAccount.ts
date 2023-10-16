import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param account
 * @returns return updated account
 */
export const updateAccount = async (account: Account) => {
  await AccountModel.findByIdAndUpdate(account._id, account.toJSON());
  return account;
};
