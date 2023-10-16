import { LinksCategoryModel } from "./schema";
import { LinkCategory } from ".";

/**
 *
 * @param linkCategory linkCategory class
 * @returns created linkCategory
 */
export const saveLinksCategory = async (linkCategory: LinkCategory) => {
  await new LinksCategoryModel(linkCategory.toJSON()).save();
  return linkCategory;
};
