import { Account } from "../account";
import { IncomingConnectionModel } from "./schema";

/**
 *
 * @param Account & targeted Account Account
 * @returns Connect
 */
export const getReverseIncomingConnection = async ({
  account,
  targetAccount,
}) => {
  const connect = await IncomingConnectionModel.findOne({
    account,
    "targetAccount.account": targetAccount.account,
  }).lean()
  return connect ? connect : null;
};
