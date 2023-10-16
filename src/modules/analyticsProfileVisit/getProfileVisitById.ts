import { AnalyticsProfileVisit, AnalyticsProfileVisitModal } from ".";

export const getProfileVisitById = async (id: string) => {
  const profileVisit = await AnalyticsProfileVisitModal.findById({
    _id: id,
  });
  return profileVisit ? new AnalyticsProfileVisit(profileVisit) : null;
};
