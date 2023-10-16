import { AnalyticsContactCount, AnalyticsContactCountModal } from ".";

/**
 *
 * @param AnalyticsContactCount
 * @returns
 */

export const saveAnalyticsContactCount = async (
  analyticsContactCount: AnalyticsContactCount
) => {
  const analyticsContactCounts = await new AnalyticsContactCountModal(
    analyticsContactCount.toJSON()
  ).save();
  return new AnalyticsContactCount(analyticsContactCounts);
};
