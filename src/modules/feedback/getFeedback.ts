import { FeedBack, FeedbackModal } from ".";
import { Account } from "../account";
import { User } from "../user";

export const getFeedback = async () => {
  const feedbacks = await FeedbackModal.find({isDeleted: false})
    .populate({
      path: "messageType",
      select: " _id title",
    })
    .populate({
      path: "attachment",
    })
    .populate({
      path: "userId",
      select: User.feedBackFields,
    })
    .populate({
      path: "accountId",
      select: Account.feedBackFields,
    })
    .sort({ createdAt: -1 });
  return feedbacks ? feedbacks.map((item) => new FeedBack(item)) : null;
};
