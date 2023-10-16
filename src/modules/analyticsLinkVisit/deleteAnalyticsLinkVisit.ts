import { AnalyticsLinkVisitModal } from "./schema";

/**
 * @param _id
 * delete AnalyticsLinkVisit by _id
 */
export const deleteAnalyticsLinkVisit = async (_id: string) => {
  await AnalyticsLinkVisitModal.findByIdAndDelete(_id);
};
