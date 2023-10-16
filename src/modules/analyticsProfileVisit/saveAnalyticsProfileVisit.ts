import { AnalyticsProfileVisit, AnalyticsProfileVisitModal } from ".";

/**
 *
 * @param AnalyticsProfileVisit
 * @returns
 */

export const saveAnalyticsProfileVisit = async (
  analyticsProfileVisit: AnalyticsProfileVisit
) => {
  const analyticsProfileVisits = await new AnalyticsProfileVisitModal(
    analyticsProfileVisit.toJSON()
  ).save();
  return new AnalyticsProfileVisit(analyticsProfileVisits);
};
