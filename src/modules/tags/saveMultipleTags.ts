import { TagModel } from "./schema";
import { Tag } from ".";
/**
 *
 * @param tag Tag class
 * @returns created Tag
 */
export const saveMultipleTags = async (tag: Tag[]) => {
  // console.log({tag});

  await TagModel.insertMany(tag);
  return tag as Tag[];
};
