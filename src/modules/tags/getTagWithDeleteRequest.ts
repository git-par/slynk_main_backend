import { TagModel } from "./schema";
import { Tag } from "./types";

/**
 *
 * @returns User[]
 */
export const getTagWithDeleteRequest = async () => {
  const tags = await TagModel.find({ deleteRequest: true }).sort({ _id: -1 });
  return tags.map((tag) => new Tag(tag));
};
