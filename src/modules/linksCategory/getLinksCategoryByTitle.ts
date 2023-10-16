import { LinkCategory } from ".";
import { LinksCategoryModel } from "./schema";

/**
 *
 * @param LinksCategory Title
 * @returns relevant linkCategory or null
 */
export const getLinksCategoryByTitle = async (title: string) => {
  const linkCategory = await LinksCategoryModel.findOne({ title }).lean();
  return linkCategory ? new LinkCategory(linkCategory) : null;
};
