import { PrivateURLModel } from "./schema";

/**
 * will delete private URL
 * @param _id
 */
export const deletePrivateURL = async (_id: string) => {
  await PrivateURLModel.findByIdAndDelete(_id);
};
