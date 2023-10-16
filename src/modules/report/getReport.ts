import { ReportModal, Report } from ".";
import { Account } from "../account";
import { User } from "../user";

export const getReport = async () => {
  const report = await ReportModal.find()
    .populate({
      path: "reportBy",
      select: User.feedBackFields,
    })
    .populate({
      path: "reportedAccount",
      select: Account.feedBackFields,
      populate: [{ path: "user", select: User.feedBackFields }],
    })
    .lean();
  return report ? report.map((item) => new Report(item)) : null;
};
