import { AnalyticsContactCount, AnalyticsContactCountModal } from ".";

export const getContactCountById = async (id: string) => {
  const profileVisit = await AnalyticsContactCountModal.findById({
    _id: id,
  });
  return profileVisit ? new AnalyticsContactCount(profileVisit) : null;
};
