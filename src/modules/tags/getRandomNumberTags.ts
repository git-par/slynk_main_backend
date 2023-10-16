import { TagModel } from "./schema";

/**
 *
 * @returns random Number of all tags
 */

export const getRandomNumberTags = async () => {
  return await TagModel.aggregate([
    { $group: { _id: null, arr: { $push: "$random" } } },
    { $project: { _id: false, arr: "$arr" } },
  ]);
};
