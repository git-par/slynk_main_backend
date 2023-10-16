import { Account } from "../account";
import { ConnectModel } from "./schema";

/**
 *
 * @param Account & targeted Account Account
 * @returns Connect
 */
export const getConnectionByAccountAndTargetedAccount = async ({
  account,
  targetAccount,
}) => {
  const connect = await ConnectModel.findOne({
    account,
    "targetAccount.account": targetAccount.account,
  }).populate({
    path: "account",
    select: Account.shortFields,
    populate: [
      {
        path: "profileImage",
      },
      {
        path: "logo",
      }
    ],
  });
  return connect ? connect : null;
};
