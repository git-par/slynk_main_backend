import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant account or null
 */
export const getAccountById = async (_id: string) => {
  const account = await AccountModel.findById(_id);
  return account ? new Account(account) : null;
};
