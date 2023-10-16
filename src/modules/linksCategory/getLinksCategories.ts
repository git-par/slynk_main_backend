import { compact } from "lodash";
import { LinkCategory } from ".";
import { LinksCategoryModel } from "./schema";

export const getLinksCategories = async () => {

  const linkCategories = await LinksCategoryModel.find().sort({ index: 1 }).lean();
  return compact(linkCategories).map((link) => new LinkCategory(link));
};
