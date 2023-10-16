import { TagModel } from "./schema";
import { Tag } from ".";
// import { ImageModel } from "../image/schema";

/**
 *
 * @param tag id
 * @returns relevant tag record | null
 */

export const getTags = async (page: number, limit: number) => {
  const tag = await TagModel.find()
    .skip((page - 1) * limit)
    .limit(limit);
  // .populate({ path: "tagImage", model: ImageModel });
  return tag ? tag.map((item) => new Tag(item)) : null;
};
