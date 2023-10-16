import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param _id
 * @returns Connect
 */
export const getConnectById = async (_id: string) => {
  const connect = await ConnectModel.findById(_id);
  return connect ? new Connect(connect) : null;
};
