import { BetaUser } from ".";
import { BetaUserModel } from "./schema";

export const updateBetaUser = async (betaUser: BetaUser) => {
  await BetaUserModel.findByIdAndUpdate(betaUser._id, betaUser.toJSON());
  return betaUser;
};
