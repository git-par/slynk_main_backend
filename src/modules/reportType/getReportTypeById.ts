import { ReportType,ReportTypeModal } from ".";

/**
 *
 * @param ReportType class
 * @returns
 */
export const getReportTypeById = async (_id: string) => {
  const reportType = await ReportTypeModal.findById(_id).lean();
  return reportType ? new ReportType(reportType) : null;
};
