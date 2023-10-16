import { Links } from ".";
import { LinksModel } from "./schema";

/**
 *
 * @param _id
 * @returns Links model class
 */
export const getLinkById = async (_id: string) => {
  const link = await LinksModel.findById(_id).lean();
  return link ? new Links(link) : null;
};
