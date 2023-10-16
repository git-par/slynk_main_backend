import { IncomingConnection, IncomingConnectionModel } from ".";
import { Account } from "../account";

export const getPopulatedIncomingConnectionByAccountId = async (
  account: string
) => {
  const incomingConnection = await IncomingConnectionModel.find({
    account,
  }).populate({
    path: "account",
    select: Account.shortFields,
  }).populate({
    path:"image"
    
  }).lean();

  return incomingConnection
    ? incomingConnection.map((item) => new IncomingConnection(item))
    : null;
};
