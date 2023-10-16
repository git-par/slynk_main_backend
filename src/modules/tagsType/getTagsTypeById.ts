import { TagType, TagTypeModel } from ".";

/**
 * 
 * @param tag id
 * @returns relevant TagTypeModel record | null
 */

export const  getTagsTypeById = async (_id: string) => {
    const tagType = await TagTypeModel.findById(_id);
    return tagType ? new TagType(tagType) : null;
}