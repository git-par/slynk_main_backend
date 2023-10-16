import { Group } from ".";
import { groupModel } from "./schema";

/**
 *
 * @param group
 * @returns Group
 */
export const saveGroup = async (group: Group) => {
  await new groupModel(group).save();
  return group;
};
