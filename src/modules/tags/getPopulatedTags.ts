import { TagModel } from "./schema";
import { ITag, Tag } from ".";
import { Account } from "../account";

/**
 *
 * @param _id tag id
 * @returns return populated account
 */

export const getPopulatedTag = async (_id: string) => {
  const tag: ITag = await TagModel.findById(_id)
    .populate({ path: "accounts", select: Account.publicFields })
    .lean();
  return tag ? new Tag(tag) : null;
};
