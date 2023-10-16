import { FeedBack, FeedbackModal } from ".";
import { Account } from "../account";
import { User } from "../user";

export const getPopulatedFeedback = async (feedbackId) => {
  const feedbacks = await FeedbackModal.findById(feedbackId)
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
  return feedbacks ? new FeedBack(feedbacks) : null;
};
