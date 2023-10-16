import { ReportType, ReportTypeModal } from ".";

export const getReportTypes = async () => {
  const feedbackTypes = await ReportTypeModal.find();
  return feedbackTypes
    ? feedbackTypes.map((item) => new ReportType(item))
    : null;
};
