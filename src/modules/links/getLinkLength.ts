import { LinksModel } from "./schema";

/**
 *
 * @returns []Links
 */
export const getLinkLength = async () => {
  const links = await LinksModel.findOne().lean();
  return links ? links.length : 20;
};
