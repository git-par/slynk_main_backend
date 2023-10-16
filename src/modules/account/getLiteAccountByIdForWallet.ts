import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant account || null
 */
export const getLiteAccountByIdForWallet = async (_id: string) => {
  const account = await AccountModel.findById(_id)
    .populate("googleWalletPicId", "")

    .lean();
  return account ? new Account(account) : null;
};
