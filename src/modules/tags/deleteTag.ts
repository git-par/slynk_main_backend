import { TagModel } from "./schema";

/**
 * will delete user
 * @param _id
 */
export const deleteTag = async (_id: string) => {
  await TagModel.findByIdAndDelete(_id);
};
