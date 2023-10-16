import { Account, IAccount } from "../account";
import { PrivateURLModel } from "./schema";

/**
 *
 * @param _id privateURL
 * @returns return populated account
 */
export const getPopulatedAccountByPrivateURL = async (privateURL: string) => {
  const account: IAccount = await PrivateURLModel.find({ privateURL })
    .populate({
      path: "accountId",
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
        },
      ],
    })
    .lean();
  return account ? new Account(account) : null;
};
