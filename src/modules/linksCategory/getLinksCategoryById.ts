import { LinksCategoryModel } from "./schema";
import { LinkCategory } from ".";

/**
 *
 * @param _id
 * @returns relevant linkCategory or null
 */
export const getLinksCategoryById = async (_id: string) => {
  const linkCategory = await LinksCategoryModel.findById(_id);
  return linkCategory ? new LinkCategory(linkCategory) : null;
};
