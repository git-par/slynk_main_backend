import { AccountLinkModel } from "./schema";

/**
 * delete all accountLink by linkId
 * @param link
 */
export const deleteAccountLinkByLinkId = async (link: string) => {
  await AccountLinkModel.deleteMany({ link });
};
