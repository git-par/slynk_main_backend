import { Group } from ".";
import { groupModel } from "./schema";

/**
 *
 * @param _id
 * @returns Group
 */
export const getGroupById = async (_id: string) => {
  const group = await groupModel.findById(_id);
  return group ? new Group(group) : null;
};
