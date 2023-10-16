import { TagModel } from "./schema";
import { Tag } from ".";

/**
 *
 * @param tag Tag class
 * @returns created Tag
 */

export const saveTags = async (tag: Tag) => {
  const tags = await new TagModel(tag.toJSON()).save();
  return new Tag(tags);
};
