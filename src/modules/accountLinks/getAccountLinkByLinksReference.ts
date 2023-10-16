import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

/**
 *
 * @param accountLink
 * @returns AccountLink[]
 */
export const getAccountLinkByLinksReference = async (accountLink: string) => {
  const accountLinks = await AccountLinkModel.find({
    "links.accountLink": accountLink,
  });
  return accountLinks.map((al) => new AccountLink(al));
};
