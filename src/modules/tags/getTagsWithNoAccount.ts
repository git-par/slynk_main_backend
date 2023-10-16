import { TagModel } from "./schema";
import { Tag } from ".";

/**
 *
 * @param
 * @returns  tag record
 */

export const getTagsWithNoAccount = async () => {
  const tag = await TagModel.find({ account: null });
  return tag ? tag.map((t) => new Tag(t)) : null;
};
