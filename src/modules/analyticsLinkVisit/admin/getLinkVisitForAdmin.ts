/**
 * @description Get link visit for admin
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<AnalyticsLinkVisitModal[]>}
 */
import { AnalyticsLinkVisitModal } from "../schema";

export const getLinkVisitForAdmin = async (startDate: Date, endDate: Date) => {
  const currentData = await AnalyticsLinkVisitModal.aggregate([
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
