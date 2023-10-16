import { ConnectModel } from "./schema";

/**
 * remove connect for account
 * @param _id
 */
export const deleteConnect = async (_id: string) => {
  await ConnectModel.findByIdAndDelete(_id);
};
