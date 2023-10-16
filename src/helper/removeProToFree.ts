import { get as _get } from "lodash";
import { IAccount } from "../modules/account";
import { IUser, User } from "../modules/user";
import { getAccountLinkWhere, IAccountLink } from "../modules/accountLinks";
export const removeProToFree = async (user: IUser) => {
  if (user.isPro) {
    return new User(user);
  }
  const userAccounts = user.accounts;
  const freeAccounts = userAccounts.find((account: IAccount) => {
    return account.type === "PERSONAL";
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   @ts-ignore
  const freeLinks = await removeProLinks(freeAccounts);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   @ts-ignore
  freeAccounts.links = freeLinks;
  user.accounts = [freeAccounts];

  return new User(user);
};

export const removeProLinks = async (account: IAccount) => {
  const freeLinks = account.links.filter((links: IAccountLink) => {
    return !_get(links, "link.isPro");
  });
  const tempLinks = [];

  for await (const value of freeLinks) {
    const accountLinks = await getAccountLinkWhere({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      link: value.link._id,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      account: account._id.toString(),
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (value.link.maxLinks.forFreeUser >= accountLinks.length) {
      tempLinks.push(value);
    }
  }

  return tempLinks;
};
