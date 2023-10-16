import { AnalyticsLinkVisit, AnalyticsLinkVisitModal } from ".";

export const getAnalyticsLinkVisits = async () => {
  const analyticsLinkVisit = await AnalyticsLinkVisitModal.find();
  return analyticsLinkVisit
    ? analyticsLinkVisit.map((item) => new AnalyticsLinkVisit(item))
    : null;
};
