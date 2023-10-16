import { isArray } from "lodash";
import { IncomingConnectionModel } from ".";
import { IncomingConnection } from ".";

/**
 *
 * @param accountId
 * @returns
 */

export const getIncomingConnectionByNewRequest = async (accountId: string) => {
  const incomingConnection = await IncomingConnectionModel.find({
    "targetAccount.account": accountId,
    newRequest: true,
  });

  return isArray(incomingConnection) && incomingConnection.length
    ? incomingConnection.map((item) => new IncomingConnection(item))
    : null;
};
