import { PrivateURL } from ".";
import { PrivateURLModel } from "./schema";
/**
 *
 * @param privateURL privateURL class
 * @returns privateURL class
 */
export const savePrivateURL = async (privateURL: PrivateURL) => {
  await new PrivateURLModel(privateURL.toJSON()).save();
  return privateURL;
};
