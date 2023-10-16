import { TagModel } from "./schema";
import { ITag, Tag } from ".";

/**
 *
 * @param _id tag id
 * @returns return populated account
 */

export const getTagsByAccountId = async (_id: string) => {
  const tag: ITag[] = await TagModel.find({ account: _id })
    .populate({
      path: "tagImage",
    });

  return tag ? tag.map((item) => new Tag(item)) : null;
};
