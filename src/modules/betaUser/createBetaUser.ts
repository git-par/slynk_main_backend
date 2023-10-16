import { BetaUserModel } from "./schema";
import { BetaUser } from "./types";

export const createBetaUser = async (betaUser: BetaUser) => {
  await new BetaUserModel(betaUser.toJSON()).save();
  return betaUser;
};
