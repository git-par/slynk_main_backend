import { Tag } from ".";
import { TagModel } from "./schema";

export const getTagNoPopulatedByUrl = async (urlName: string) => {
  const tag = await TagModel.findOne({ urlName })
  
  return tag ? new Tag(tag) : null;
};
