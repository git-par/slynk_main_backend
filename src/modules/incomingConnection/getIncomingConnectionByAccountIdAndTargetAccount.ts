import { IncomingConnection, IncomingConnectionModel } from ".";

export const getIncomingConnectionByAccountIdAndTargetAccount = async ({
  account,
  targetAccount,
}) => {
  const incomingConnection = await IncomingConnectionModel.findOne({
    account: account,
    "targetAccount.account": targetAccount,
  });

  return incomingConnection ? new IncomingConnection(incomingConnection) : null;
};
