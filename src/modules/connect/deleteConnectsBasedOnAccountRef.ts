import { ConnectModel } from "./schema";

/**
 * delete all connects with ref of account
 * mainly use for delete account
 * @param accountId accountId
 */
export const deleteConnectsBasedOnAccountRef = async (accountId: string) => {
  await ConnectModel.deleteMany({
    $or: [{ account: accountId }, { "targetAccount.account": accountId }],
  });
};
