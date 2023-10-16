import { compact } from "lodash";
import { Links } from ".";
import { LinksModel } from "./schema";

/**
 *
 * @returns []Links
 */
export const getLinks = async () => {
  const links = await LinksModel.find().lean();
  return compact(links).map((link) => new Links(link));
};
