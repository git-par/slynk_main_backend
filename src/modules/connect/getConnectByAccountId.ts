import { Connect } from ".";
import { ConnectModel } from "./schema";

/**
 *
 * @param account
 * @returns Connect[]
 */
export const getConnectByAccountId = async (account: string) => {
  const connects = await ConnectModel.find({ account });
  return connects.map((connect) => new Connect(connect));
};
