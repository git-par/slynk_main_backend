import { Links } from ".";
import { LinksModel } from "./schema";

export const getPopulatedLinkById = async (_id: string) => {
  const link = await LinksModel.findById(_id).populate("category").lean();
  return link ? new Links(link) : null;
};
