import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

export const getAccountLinksByAccountId = async (accountId: string) => {
  const accountLink = await AccountLinkModel.find({
    account: accountId,
  })
    .populate("link", "")
    .populate({
      path: "link",
      populate: {
        path: "category",
        select: "_id title",
      },
    })
    .populate({
      path: "logo",
    })
    .lean();
  return accountLink.map((al) => new AccountLink(al));
};
