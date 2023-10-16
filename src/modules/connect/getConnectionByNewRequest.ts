import { isArray } from "lodash";
import { ConnectModel } from "./schema";
import { Connect } from "./types";
/**
 *
 * @param accountId
 * @returns
 */

export const getConnectionByNewRequest = async (accountId: string) => {
  console.log(accountId);
  const connect = await ConnectModel.find({
    account: accountId,
    newRequest: true,
  });

  return isArray(connect) && connect.length
    ? connect.map((item) => new Connect(item))
    : null;
};
