import { AccountLink } from ".";
import { AccountLinkModel } from "./schema";

/**
 *
 * @param accountLink
 * @returns accountlink
 */
export const updateAccountLink = async (accountLink: AccountLink) => {
  await AccountLinkModel.findByIdAndUpdate(
    accountLink._id,
    {"$set":accountLink.toJSON()}
  );
  return accountLink;
};
