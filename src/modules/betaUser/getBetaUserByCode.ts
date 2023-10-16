import { BetaUserModel } from "./schema";
import { BetaUser } from "./types";

export const getBetaUserByCode = async (code: string) => {
  const betaUsers = await BetaUserModel.findOne({ code });
  return betaUsers ? new BetaUser(betaUsers) : null;
};
