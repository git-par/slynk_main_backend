/**
 * @description Get profile visit for admin
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<AnalyticsProfileVisitModal[]>}
 */

import { AnalyticsProfileVisitModal } from "../schema";

export const getProfileVisitForAdmin = async (
  startDate: Date,
  endDate: Date
) => {
  const currentData = await AnalyticsProfileVisitModal.aggregate([
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
