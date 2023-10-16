import { TagModel } from "./schema";
import { Tag } from ".";

/**
 *
 * @param tag class
 * @returns updated tag record
 */

export const updateTags = async (tag: Tag) => {
  await TagModel.findByIdAndUpdate(tag._id, tag.toJSON());
  return tag;
};
