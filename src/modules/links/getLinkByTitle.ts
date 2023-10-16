import { Links } from ".";
import { LinksModel } from "./schema";

/**
 * 
 * @param title 
 * @returns 
 */
export const getLinkByTitle = async (title: string) => {
  const link = await LinksModel.findOne({ title }).lean();
  return link ? new Links(link) : null;
};
