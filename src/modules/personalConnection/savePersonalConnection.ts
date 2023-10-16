import { getPersonalConnectionById, PersonalConnection } from ".";
import { personalConnectionModel } from "./schema";

/**
 *
 * @param personalConnection
 * @returns PersonalConnection
 */
export const savePersonalConnection = async (
  personalConnection: PersonalConnection
) => {
  await new personalConnectionModel(personalConnection.toJSON()).save();
  const personalConnectionInserted = await getPersonalConnectionById(
    personalConnection._id
  );
  return new PersonalConnection(personalConnectionInserted);
};
