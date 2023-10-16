import { AnalyticsLinkVisitModal } from ".";

/**
 *
 * @param accountId
 * @param startDate
 * @param endDate
 * @param diffStartDate
 * @returns
 */

export const getLinkVisitCountByOwner = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  diffStartDate: Date
) => {
  const startConnect = await AnalyticsLinkVisitModal.find({
    ownerAccountId: accountId,
    createdAt: {
      $lte: startDate,
      $gte: diffStartDate,
    },
  }).countDocuments();

  const endConnect = await AnalyticsLinkVisitModal.find({
    ownerAccountId: accountId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).countDocuments();

  const connect = {
    startConnect,
    endConnect,
  };
  return connect;
};
