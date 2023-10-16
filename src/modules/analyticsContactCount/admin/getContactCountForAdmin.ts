/**
 * @description Get contact count for admin
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<AnalyticsContactCountModal[]>}
 */

import { AnalyticsContactCountModal } from "../schema";

export const getContactCountForAdmin = async (
  startDate: Date,
  endDate: Date
) => {
  const currentData = await AnalyticsContactCountModal.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: {
          $sum: 1,
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return currentData;
};
