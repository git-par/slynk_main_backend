import { Group } from ".";
import { Account } from "../account";
import { groupModel } from "./schema";

/**
 *
 * @param owner
 * @returns Group[]
 */
export const getPopulatedGroupsByOwnerId = async (owner: string) => {
  const groups = await groupModel
    .find({ owner })

    .populate({
      path: "accounts",
      select: Account.publicFields,
      populate: [{
        path: "profileImage",
      }, {
          path: "logo",
        }],
    })
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
          select: "profileImage",
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
  return groups.map((group) => new Group(group));
};
