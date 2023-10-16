import { TagModel } from "./schema";
import { Tag } from ".";

/**
 *
 * @param tag id
 * @returns relevant tag record | null
 */

export const getTagsById = async (_id: string) => {
  const tag = await TagModel.findById(_id).populate({
    path: "tagImage",
  });
  return tag ? new Tag(tag) : null;
};
