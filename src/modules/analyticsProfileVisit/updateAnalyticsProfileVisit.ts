import { AnalyticsProfileVisit, AnalyticsProfileVisitModal } from ".";

/**
 *
 * @param faq
 * @returns
 */

export const updateAnalyticsProfileVisit = async (
  analyticsProfileVisit: AnalyticsProfileVisit
) => {
  await AnalyticsProfileVisitModal.findByIdAndUpdate(
    analyticsProfileVisit._id,
    analyticsProfileVisit.toJSON()
  );
  return analyticsProfileVisit;
};
