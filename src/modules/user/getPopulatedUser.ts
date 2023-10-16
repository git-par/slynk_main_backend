import { omit } from "lodash";
import { IUser, User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns return populated account
 */
export const getPopulatedUser = async (_id: string) => {
  const user: IUser = await UserModel.findById(_id)
    .populate({
      path: "accounts",
      populate: [
        {
          path: "links",
          populate: [
            {
              path: "link",
            },
            { path: "logo" },
            { path: "fileValue" },
          ],
        },
        {
          path: "profileImage",
        },
        {
          path: "qrImage",
        },
        {
          path: "logo",
        },
        {
          path: "qrImage",
        }
      ],
    })
    .lean();
  return user ? new User(omit(user, ['password', 'updateEmailOTP', 'RESETToken'])) : null;
};
