import { IncomingConnection, IncomingConnectionModel } from ".";
import { Account } from "../account";

export const getPopulatedIncomingConnectionByTargetAccountId = async (
  targetAccount: string
) => {
  const incomingConnection = await IncomingConnectionModel.find({
    "targetAccount.account": targetAccount,
  })
    .populate({
      path: "account",
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
    })
    .lean();

  return incomingConnection
    ? incomingConnection.map((item) => new IncomingConnection(item))
    : null;
};
