import { Account } from ".";
import { AccountModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant account or null
 */
export const getLiteAccountByIdQr = async (_id: string) => {
  const account = await AccountModel.findById(_id)
    .select(Account.QrFields)
    .populate("qrImage");
  return account ? account : null;
};
