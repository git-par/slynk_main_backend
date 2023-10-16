import { AccountLinkModel } from "./schema";
/**
 * will delete all account links by account
 * @param account accountId
 */
export const deleteAccountLinkByAccountId = async (account: string) => {
  await AccountLinkModel.deleteMany({ account });
};
