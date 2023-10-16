import { AnalyticsLinkVisit, AnalyticsLinkVisitModal } from ".";

/**
 *
 * @param AnalyticsLinkVisit class
 * @returns
 */
export const getAnalyticsLinkVisitById = async (_id: string) => {
  const analyticsLinkVisit = await AnalyticsLinkVisitModal.findById(_id).lean();
  return analyticsLinkVisit ? new AnalyticsLinkVisit(analyticsLinkVisit) : null;
};
