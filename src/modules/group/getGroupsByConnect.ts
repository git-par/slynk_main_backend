import { Group } from ".";
import { groupModel } from "./schema";

/**
 * get all group by connect id
 * @param connect
 * @returns array of group
 */
export const getGroupsByConnect = async (connect: string) => {
  const groups = await groupModel.find({ connects: connect });
  return groups.map((group) => new Group(group));
};
