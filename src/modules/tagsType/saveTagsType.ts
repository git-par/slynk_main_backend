import { TagType, TagTypeModel } from ".";

/**
 *
 * @param tag Tag class
 * @returns created Tag
 */

export const saveTagsType = async (tagType: TagType) => {
  const tagTypes = await new TagTypeModel(tagType.toJSON()).save();
  return new TagType(tagTypes);
};
