import { Links } from ".";
import { LinksModel } from "./schema";

/**
 *
 * @param link
 * @returns link class object
 */
export const saveLink = async (link: Links) => {
  await new LinksModel(link.toJSON()).save();
  return link;
};
