import { LinkCategory, ILinksCategory } from ".";
import { Links } from "../links";
import { LinksCategoryModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns return populated account
 */
export const getLitePopulatedLinksCategory = async () => {
  const linksCat: ILinksCategory[] = await LinksCategoryModel.find()
    .sort({ index: 1 })
    .populate({
      path: "links",
      select: Links.publicFields,
    })
    .lean();
  return linksCat ? linksCat.map((item) => new LinkCategory(item)) : null;
};
