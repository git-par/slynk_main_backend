import { BetaUserModel } from "./schema";
import { BetaUser } from "./types";

export const getBetaUserByEmail = async (email: string) => {
  const betaUser = await BetaUserModel.findOne({ email: { $regex: new RegExp(`^${email}$`), $options: "i" } });
  return betaUser ? new BetaUser(betaUser) : null;
};
