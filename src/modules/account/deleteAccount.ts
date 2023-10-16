import { AccountModel } from "./schema";

/**
 * be careful when deleting the account
 * make sure first delete all the account dependency
 * @param _id account id
 */
export const deleteAccount = async (_id: string) => {
  await AccountModel.findByIdAndDelete(_id);
};
