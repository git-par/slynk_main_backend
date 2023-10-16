import { Group } from ".";
import { groupModel } from "./schema";

/**
 *
 * @param group
 * @returns Group
 */
export const updateGroup = async (group: Group) => {
  await groupModel.findByIdAndUpdate(group._id, group.toJSON());
  return group;
};
