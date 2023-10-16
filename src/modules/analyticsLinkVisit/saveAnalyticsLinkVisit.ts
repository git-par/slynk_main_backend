import { AnalyticsLinkVisit, AnalyticsLinkVisitModal } from ".";

/**
 *
 * @param AnalyticsLinkVisit
 * @returns
 */

export const saveAnalyticsLinkVisit = async (
  analyticsLinkVisit: AnalyticsLinkVisit
) => {
  const analyticsLinkVisits = await new AnalyticsLinkVisitModal(
    analyticsLinkVisit.toJSON()
  ).save();
  return new AnalyticsLinkVisit(analyticsLinkVisits);
};
