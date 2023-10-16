import { groupModel } from "./schema";

/**
 * delete group by owner id
 * @param owner ownerId
 */
export const deleteGroupByOwnerId = async (owner: string) => {
  await groupModel.deleteMany({ owner });
};
