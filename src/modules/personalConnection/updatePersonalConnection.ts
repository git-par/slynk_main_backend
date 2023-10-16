import { PersonalConnection } from ".";
import { personalConnectionModel } from "./schema";

/**
 *
 * @param personalConnection
 * @returns PersonalConnection
 */
export const updatePersonalConnection = async (
  personalConnection: PersonalConnection
) => {
  const result = await personalConnectionModel
    .findByIdAndUpdate(personalConnection._id, personalConnection.toJSON(), {
      new: true,
    })
    .lean();
  return new PersonalConnection(result);
};
