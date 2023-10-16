import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

export const saveAccountLink = async (accountLink: AccountLink) => {
  await new AccountLinkModel(accountLink.toJSON()).save();
  return accountLink;
};
