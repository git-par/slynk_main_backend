import { IncomingConnectionModel } from ".";
import { IncomingConnection } from ".";
import { Account } from "../account";

export const getPopulatedIncomingConnectionByID = async (_id: string) => {
  const incomingConnection = await IncomingConnectionModel.findById(_id)
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
  return incomingConnection ? new IncomingConnection(incomingConnection) : null;
};
