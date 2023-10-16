import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

/**
 *
 * @param link
 * @returns list of account
 */
export const getAccountLinkByLinkId = async (link: string) => {
  const accountLinks = await AccountLinkModel.find({ link });
  return accountLinks.map((al) => new AccountLink(al));
};
