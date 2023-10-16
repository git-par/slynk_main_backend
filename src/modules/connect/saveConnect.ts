import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param connect
 * @returns Connect
 */
export const saveConnect = async (connect: Connect) => {
  await new ConnectModel(connect.toJSON()).save();
  const con = ConnectModel.findById(connect._id);
  return con;
};
