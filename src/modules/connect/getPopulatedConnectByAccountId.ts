import { Connect } from ".";
import { Account } from "../account";
import { ConnectModel } from "./schema";

/**
 *
 * @param account
 * @returns Connect[]
 */
export const getPopulatedConnectByAccountId = async (account: string) => {
  const connects = await ConnectModel.find({ account })
    .populate({
      path: "targetAccount.account",
      select: Account.shortFields,
      populate: [
        {
          path: "profileImage",
        },
        {
          path: "logo",
        },
        {
          path: "user",
          select: "isPro",
        },
      ],
    })
    .populate({
      path: "image",
    });
  return connects.map((connect) => new Connect(connect));
};
