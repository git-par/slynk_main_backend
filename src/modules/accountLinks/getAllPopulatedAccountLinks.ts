import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

export const getAllPopulatedAccountLinks = async () => {
  const accountLink = await AccountLinkModel.find().populate("link");
  return accountLink.map((al) => new AccountLink(al));
};
