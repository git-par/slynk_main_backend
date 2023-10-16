import { Report, ReportModal } from ".";
import { Account } from "../account";
import { User } from "../user";

/**
 *
 * @param Report class
 * @returns
 */
export const getReportById = async (_id: string) => {
  const report = await ReportModal.findById(_id)
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
  return report ? new Report(report) : null;
};
