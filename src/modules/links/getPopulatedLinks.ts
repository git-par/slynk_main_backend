import { compact } from "lodash";
import { ILinks, Links } from ".";
import { LinksModel } from "./schema";

/**
 *
 * @returns []Links
 */
export const getPopulatedLinks = async () => {
  const links = await LinksModel.find().populate("category").lean();
  return compact(links).map((link: ILinks) => {
    new Links({ ...link, category: compact(link.category || []) });
  });
};
