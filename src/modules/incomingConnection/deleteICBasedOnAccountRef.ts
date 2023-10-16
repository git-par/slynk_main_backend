import { IncomingConnectionModel } from ".";

/**
 * delete all incoming connects with ref of account
 * mainly use for delete account
 * @param accountId accountId
 */
export const deleteICBasedOnAccountRef = async (accountId: string) => {
  await IncomingConnectionModel.deleteMany({
    $or: [{ account: accountId }, { "targetAccount.account": accountId }],
  });
};
