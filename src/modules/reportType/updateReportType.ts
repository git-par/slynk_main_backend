import { ReportType, ReportTypeModal } from ".";
/**
 *
 * @param ReportType
 * @returns updated ReportType
 */

export const updateReportType = async (reportType: ReportType) => {
  await ReportTypeModal.findByIdAndUpdate(
    reportType._id,
    reportType.toJSON()
  );
  return new ReportType(reportType);
};
