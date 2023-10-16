import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param accountName account name
 * @returns accounts[]
 */
export const getAccountByAccountName = async (accountName: string) => {
  const account = await AccountModel.findOne({
    accountName: { $regex: new RegExp(`^${accountName}$`), $options: "i" },
  });
  return account ? new Account(account) : null;
};

export const getPopulatedAccountByAccountName = async (accountName: string) => {
  const account = await AccountModel.findOne({
    accountName: { $regex: new RegExp(`^${accountName}$`), $options: "i" },
  })
    .populate([
      {
        path: "profileImage",
      },
      {
        path: "logo",
      },
      { path: "qrImage" },
    ])
    .populate({
      path: "user",
      select: "isPro",
    })
    .populate({
      path: "links",
      populate: [
        {
          path: "link",
        },
        { path: "logo" },
        { path: "fileValue" },
      ],
    })
    .lean();

  return account ? new Account(account) : null;
};
