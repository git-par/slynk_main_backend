import { AnalyticsContactCountModal } from ".";

/**
 *
 * @param accountId
 * @param startDate
 * @param endDate
 * @param diffStartDate
 * @returns
 */

export const getContactCountByOwner = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  diffStartDate: Date
) => {
  const startConnect = await AnalyticsContactCountModal.find({
    ownerAccountId: accountId,
    createdAt: {
      $lte: startDate,
      $gte: diffStartDate,
    },
  }).countDocuments();

  const endConnect = await AnalyticsContactCountModal.find({
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
