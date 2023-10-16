import { TagModel } from "./schema";

/**
 *
 * @returns relevant tag record | null
 */

export const getTagsCount = async () => {
  const count = await TagModel.countDocuments();
  return count ? count : 0;
};
