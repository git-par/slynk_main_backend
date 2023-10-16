import { IncomingConnection, IncomingConnectionModel } from ".";

/**
 *
 * @param account
 * @returns incomingconnection[]
 */
export const getIncomingConnectionByAccountId = async (account: string) => {
  const incomingconnections = await IncomingConnectionModel.find({ account });
  return incomingconnections.map((item) => new IncomingConnection(item));
};
