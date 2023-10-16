import { ReportModal } from "./schema";

/**
 * @param _id
 * delete Report by _id
 */
export const deleteReport = async (_id: string) => {
  await ReportModal.findByIdAndDelete(_id);
};
