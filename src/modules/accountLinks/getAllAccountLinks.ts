import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

export const getAllAccountLinks = async () => {
  const accountLink = await AccountLinkModel.find();
  return accountLink.map((al) => new AccountLink(al));
};
