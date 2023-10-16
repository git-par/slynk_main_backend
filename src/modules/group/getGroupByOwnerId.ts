import { Group } from ".";
import { groupModel } from "./schema";

/**
 *
 * @param owner
 * @returns Group[]
 */
export const getGroupByOwner = async (owner: string) => {
  const groups = await groupModel
    .find({ owner })
    .populate({
      path: "connects",
      populate: [
        {
          path: "account",
          select: "profileImage",
          populate: [{
            path: "profileImage",
          },
            {
              path: "logo",
            }],
        },
        { path: "image" },
        {
          path: "targetAccount.account",
          select: "profileImage isArchive",
          populate: [{
            path: "profileImage",
          }, {
              path: "logo",
            }],
        },
      ],
    })
    .lean();
  return groups.map((group) => new Group(group));
};
