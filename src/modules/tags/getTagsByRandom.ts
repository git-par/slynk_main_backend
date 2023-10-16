import { TagModel } from "./schema";
import { Tag } from ".";

/**
 *
 * @param tag random
 * @returns relevant tag record | null
 */

export const getTagsByRandom = async (random: string) => {
  const tag = await TagModel.findOne({ random }).lean();
  return tag ? new Tag(tag) : null;
};
