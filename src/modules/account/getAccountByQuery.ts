import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param accountName account accountName
 * @returns relevant account record | null
 */
//  db.recipes.find({ $text: { $search: "spiced" } });

export const getAccountByQuery = async (query: string) => {
  if (query.split(" ").length >= 2) {
    const account = await AccountModel.find(
      {
        $and: [
          { isDiscoverable: true },
          { isArchive: false },
          { $text: { $search: query } },
          // {
          //   $or: [
          //     { firstName: { $regex: query, $options: "i" } },
          //     { lastName: { $regex: query, $options: "i" } },
          //     { accountName: { $regex: query, $options: "i" } },
          //     { companyName: { $regex: query, $options: "i" } },
          //     { role: { $regex: query, $options: "i" } },
          //     { location: { $regex: query, $options: "i" } },
          //   ],
          // },
        ],
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .select(Account.searchUserFields)
      .populate("profileImage")
      .populate({
        path: "user",
        select: "isPro",
      });

    return account ? account : null;
  } else {
    const account = await AccountModel.find(
      {
        $and: [
          { isDiscoverable: true },
          { isArchive: false },
          // { $text: { $search: query } },
          {
            $or: [
              { firstName: { $regex: query, $options: "i" } },
              { lastName: { $regex: query, $options: "i" } },
              { accountName: { $regex: query, $options: "i" } },
              { companyName: { $regex: query, $options: "i" } },
              { role: { $regex: query, $options: "i" } },
              { location: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }
      // { score: { $meta: "textScore" } }
    )
      // .sort({ score: { $meta: "textScore" } })
      .select(Account.searchUserFields)
      .populate("profileImage")
      .populate({
        path: "user",
        select: "isPro",
      });

    return account ? account : null;
  }
};
