import { FeedBackType, FeedbackTypeModal } from ".";

export const getFeedbackTypes = async () => {
  const feedbackTypes = await FeedbackTypeModal.find();
  return feedbackTypes
    ? feedbackTypes.map((item) => new FeedBackType(item))
    : null;
};
