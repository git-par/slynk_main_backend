import { AccountModel } from "./schema";

/**
 * increment view count
 * @param _id 
 */
export const incrementAccountView = async (_id: string) => {
  await AccountModel.findByIdAndUpdate(_id, { $inc: { views: 1 } });
};
