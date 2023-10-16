import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param Account & targeted Account Account
 * getIncomingConnectionwithConnectionByAccountAndTargetedAccount
 * @returns Connect
 */
export const getIncomingConnectionWithConnection = async ({
  account,
  targetAccount,
}) => {
  const connect = await ConnectModel.findOne({
    account: account,
    "targetAccount.account": targetAccount,
  });
  return connect ? new Connect(connect) : null;
};
