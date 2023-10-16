import { IncomingConnection, IncomingConnectionModel } from ".";

export const getNewRequestBySlynkAndNonSlynk = async (
  targetAccount: string
) => {
  const incomingConnection = await IncomingConnectionModel.find({
    "targetAccount.account": targetAccount,
    newRequest: true,
  }).lean();

  return incomingConnection
    ? incomingConnection.map((item) => new IncomingConnection(item))
    : null;
};
