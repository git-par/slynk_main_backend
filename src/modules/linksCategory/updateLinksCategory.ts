import { LinksCategoryModel } from "./schema";
import { LinkCategory } from ".";

/**
 *
 * @param linkCategory linkCategory class
 * @returns created linkCategory
 */
export const updateLinksCategory = async (linkCategory: LinkCategory) => {
  await LinksCategoryModel.findByIdAndUpdate(
    linkCategory._id,
    linkCategory.toJSON()
  );
  return linkCategory;
};
