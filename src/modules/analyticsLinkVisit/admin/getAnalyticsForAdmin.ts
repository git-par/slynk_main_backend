/**
 *
 * @param accountId
 * @param startDate
 * @param endDate
 * @param diffStartDate
 * @returns
 */

import { AnalyticsProfileVisitModal } from "../../analyticsProfileVisit";
import { AnalyticsLinkVisitModal } from "../schema";

export const getAnalyticsForAdmin = async () => {
  const currentData = await AnalyticsProfileVisitModal.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  return currentData;
};
