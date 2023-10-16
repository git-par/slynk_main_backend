import { LinksCategoryModel } from "./schema";

/**

 * @param _id LinkCategory id
 */
export const deleteLinksCategory =  async (_id: string) => {
    await LinksCategoryModel.findByIdAndDelete(_id);
};
