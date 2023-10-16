import { IncomingConnection } from ".";
import { IncomingConnectionModel } from "./schema";

/**
 *
 * @param incomingConnection
 * @returns
 */

export const saveIncomingConnection = async (
  incomingConnection: IncomingConnection
) => {
  await new IncomingConnectionModel(incomingConnection.toJSON()).save();
  const inCon = await IncomingConnectionModel.findById(incomingConnection._id);
  return inCon;
};
