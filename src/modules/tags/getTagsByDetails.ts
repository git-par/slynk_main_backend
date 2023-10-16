import { TagModel } from "./schema";
import { Tag } from ".";

export const getTagsByDetails = async (data: any) => {
  console.log(data);
  const tags = await TagModel.find(data);

  return tags ? tags.map((item) => new Tag(item)) : null;
};
