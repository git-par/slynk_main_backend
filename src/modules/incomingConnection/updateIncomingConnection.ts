import { IncomingConnection } from ".";
import { IncomingConnectionModel } from ".";

/**
 *
 * @param incomingConnection
 * @returns incomingConnection
 */

export const updateIncomingConnection = async (incomingConnection: IncomingConnection) => {
  await IncomingConnectionModel.findByIdAndUpdate(
    incomingConnection._id,
    incomingConnection.toJSON()
  );
  return incomingConnection;
};
