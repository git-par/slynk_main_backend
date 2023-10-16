import { ReportTypeModal } from "./schema";

/**
 * @param _id
 * delete ReportType by _id
 */
export const deleteReportType = async (_id: string) => {
  await ReportTypeModal.findByIdAndDelete(_id);
};
