import { PersonalConnection } from ".";
import { personalConnectionModel } from "./schema";

/**
 *
 * @param _id
 * @returns PersonalConnection | NULL
 */
export const getPersonalConnectionById = async (_id: string) => {
  const personalConnection = await personalConnectionModel
    .findById(_id)
    .populate("profileImage")
    .lean();
  return personalConnection ? new PersonalConnection(personalConnection) : null;
};
