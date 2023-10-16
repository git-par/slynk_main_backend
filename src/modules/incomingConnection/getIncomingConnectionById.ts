import { IncomingConnection, IncomingConnectionModel } from ".";

/**
 *
 * @param _id
 * @returns IncomingConnection
 */

export const getIncomingConnectionById = async (_id: string) => {
  const incomingConnection = await IncomingConnectionModel.findById(_id);
  return incomingConnection ? new IncomingConnection(incomingConnection) : null;
};
