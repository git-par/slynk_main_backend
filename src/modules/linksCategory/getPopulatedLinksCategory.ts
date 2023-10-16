import { LinkCategory, ILinksCategory } from ".";
import { LinksCategoryModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns return populated account
 */
export const getPopulatedLinksCategory = async (_id: string) => {
  const user: ILinksCategory = await LinksCategoryModel.findById(_id)
    .populate("links", "")
    .lean();
  return user ? new LinkCategory(user) : null;
};
