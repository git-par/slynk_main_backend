import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant account || null
 */
export const getPopulatedAccount = async (_id: string) => {
  const account = await AccountModel.findById(_id)
    .populate("user", "_id email googleId accounts")
    .populate("profileImage", "")
    .populate("logo", "")
    .populate("qrImage", "")
    .populate({
      path: "links",
      populate: [
        {
          path: "link",
        },
        {
          path: "logo",
        },
        { path: "fileValue" },
      ],
    })
    .lean();
  return account ? new Account(account) : null;
};
