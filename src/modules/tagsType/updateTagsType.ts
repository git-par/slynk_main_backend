import { TagType, TagTypeModel } from ".";

/**
 *
 * @param tagType class
 * @returns updated tag tagType
 */

export const updateTagsType = async (tagType: TagType) => {
  await TagTypeModel.findByIdAndUpdate(tagType._id, tagType.toJSON());
  return tagType;
};
