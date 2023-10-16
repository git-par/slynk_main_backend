import { LinksModel } from "./schema";

/**
 * @param _id
 * delete link by _id
 */
export const deleteLinkById = async (_id: string) => {
  await LinksModel.findByIdAndDelete(_id);
};
