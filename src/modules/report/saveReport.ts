import { Report } from ".";
import { ReportModal } from "./schema";

/**
 *
 * @param Report Report class
 * @returns created Report
 */
export const saveReport = async (report: Report) => {
  await new ReportModal(report.toJSON()).save();
  return report;
};
