import { PersonalConnection } from ".";
import { personalConnectionModel } from "./schema";

/**
 *
 * @param accountId
 * @returns  PersonalConnection[]
 */
export const getPersonalConnectionByAccountId = async (accountId: string) => {
  const personalConnections = await personalConnectionModel
    .find({ account: accountId })
    .populate("profileImage")
    .lean();
  return personalConnections.map((pl) => new PersonalConnection(pl));
};
