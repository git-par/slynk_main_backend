import { personalConnectionModel } from "./schema";

/**
 *
 * @param _id
 */
export const deletePersonalConnectionById = async (_id: string) => {
  await personalConnectionModel.findByIdAndDelete(_id);
};
