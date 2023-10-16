import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param accountName account accountName
 * @returns relevant account record | null
 */
export const getAccByAccNameFromQuery = async (query: string) => {
  const account = await AccountModel.findOne({
    accountName: query,
  }).collation({ locale: "en", strength: 2 });

  return account ? new Account(account) : null;
};
