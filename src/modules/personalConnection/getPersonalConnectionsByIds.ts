import { PersonalConnection } from ".";
import { personalConnectionModel } from "./schema";

export const getPersonalConnectionsByAccountIds = async (
  personalConnectionIds: string[]
) => {
  const personalConnection = await personalConnectionModel
    .find({ _id: { $in: personalConnectionIds } })
    .lean();
  return personalConnection.map((pc) => new PersonalConnection(pc));
};
