import { Account } from "../account";
import { ConnectModel } from "./schema";

/**
 *
 * @param Account & targeted Account Account
 * @returns Connect
 */
export const getReverseConnection = async ({
  account,
  targetAccount,
}) => {
  const connect = await ConnectModel.findOne({
    account,
    "targetAccount.account": targetAccount.account,
  }).lean()
  return connect ? connect : null;
};
