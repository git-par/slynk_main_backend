import { AnalyticsProfileVisit, AnalyticsProfileVisitModal } from ".";

export const getProfileVisitSessionId = async (sessionId: string) => {
  const profileVisit = await AnalyticsProfileVisitModal.findOne({
    sessionId: sessionId,
  });
  return profileVisit ? new AnalyticsProfileVisit(profileVisit) : null;
};
