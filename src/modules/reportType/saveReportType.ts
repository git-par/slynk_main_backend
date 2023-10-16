import { ReportType, ReportTypeModal } from ".";

/**
 *
 * @param ReportType
 * @returns
 */

export const saveReportType = async (reportType: ReportType) => {
  const reportsType = await new ReportTypeModal(
    reportType.toJSON()
  ).save();
  return new ReportType(reportsType);
};
