import { AccountLinkModel } from "./schema";

/**
 *
 * @param _id
 */
export const deleteAccountLinkById = async (_id: string) => {
  await AccountLinkModel.findByIdAndDelete(_id);
};
