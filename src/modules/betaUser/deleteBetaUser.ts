import { BetaUserModel } from "./schema";

/**
 * will delete user
 * @param _id
 */
export const deleteBetaUser = async (_id: string) => {
  console.log("called");
  await BetaUserModel.findByIdAndDelete(_id);
};
