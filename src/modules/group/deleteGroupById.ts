import { groupModel } from "./schema";

/**
 *
 * @param _id
 */
export const deleteGroupById = async (_id: string) => {
  await groupModel.findByIdAndDelete(_id);
};
