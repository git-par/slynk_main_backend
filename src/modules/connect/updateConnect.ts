import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param connect
 * @returns Connect
 */
export const updateConnect = async (connect: Connect) => {
  await ConnectModel.findByIdAndUpdate(connect._id, connect.toJSON());
  return connect;
};
