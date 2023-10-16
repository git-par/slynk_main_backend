import { Connect } from ".";
import { Account } from "../account";
import { ConnectModel } from "./schema";

/**
 *
 * @param _id
 * @returns Connect
 */
export const getPopulatedConnectById = async (_id: string) => {
  const connect = await ConnectModel.findById(_id)
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

  return connect ? new Connect(connect) : null;
};
