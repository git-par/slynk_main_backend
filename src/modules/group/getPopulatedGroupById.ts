import { Group } from ".";
import { groupModel } from "./schema";

/**
 *
 * @param id
 * @returns Group
 */
export const getPopulatedGroupById = async (id: string) => {
  const group = await groupModel
    .findById(id)
    .populate({
      path: "connects",

      populate: [
        {
          path: "account",
          select: "profileImage",
          populate: [{
            path: "profileImage",
          }, {
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
    // .populate({
    //   path: "personalConnection",
    //   select: Account.publicFields,
    //   populate: {
    //     path: "profileImage",
    //   },
    // })
    .lean();
  return group ? new Group(group) : null;
};
