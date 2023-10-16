import { BetaUserModel } from "./schema";
import { BetaUser } from "./types";

export const getBetaUsers = async () => {
  const betaUsers = await BetaUserModel.find();
  return betaUsers.map((betaUser) => new BetaUser(betaUser));
};
