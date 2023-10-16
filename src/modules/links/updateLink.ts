import { Links } from ".";
import { LinksModel } from "./schema";

/**
 * update corresponding link
 * @param link
 * @returns
 */
export const updateLink = async (link: Links) => {
  await LinksModel.findByIdAndUpdate(link._id, link.toJSON());
  return link;
};
