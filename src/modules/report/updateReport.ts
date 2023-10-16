import { ReportModal } from ".";
import { Report } from ".";

/**
 *
 * @param Report class
 * @returns
 */

export const updateReport = async (report: Report) => {
  await ReportModal.findByIdAndUpdate(report._id, report.toJSON());
  return report;
};
