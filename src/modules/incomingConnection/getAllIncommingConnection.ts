import { IncomingConnection } from ".";
import { IncomingConnectionModel } from "./schema";

/**
 *
 * @param _id
 * @returns Connect
 */
export const getAllIncomingConnection = async () => {
  const connects = await IncomingConnectionModel.find().lean();
  return connects.map((connect) => new IncomingConnection(connect));
};
