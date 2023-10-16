import { AccountLinkModel } from "./schema";
import { AccountLink } from "./types";

export const getAccountLinkWhere = async (where: Record<string, unknown>) => {
  const accountLinks = await AccountLinkModel.find(where);
  return accountLinks.map((al) => new AccountLink(al));
};
