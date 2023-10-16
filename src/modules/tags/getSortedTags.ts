import { TagModel } from "./schema";
import { Tag } from ".";

export const getSortedTags = async (data: any) => {
  const tags = await TagModel.find(data);

  return tags ? tags.map((item) => new Tag(item)) : null;
};
