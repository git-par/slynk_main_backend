import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param _id
 * @returns Connect
 */
export const getAllConnection = async () => {
  const connects = await ConnectModel.find().lean();
  return connects.map((connect) => new Connect(connect));
};
