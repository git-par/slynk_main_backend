import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

export const getAccountLinkById = async (_id: string) => {
  const accountLink = await AccountLinkModel.findById(_id)
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
    .populate({
      path: "fileValue",
    })
    .lean();
  return accountLink ? new AccountLink(accountLink) : null;
};
