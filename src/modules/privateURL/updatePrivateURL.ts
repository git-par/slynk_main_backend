import { PrivateURL } from ".";
import { PrivateURLModel } from "./schema";

/**
 *
 * @param privateURL privateURL class
 * @returns privateURL class
 */

export const updatePrivateURL = async (privateURL: PrivateURL) => {
  await PrivateURLModel.findByIdAndUpdate(privateURL._id, privateURL.toJSON());
  return privateURL;
};
