import { FeedBack, FeedbackModal } from ".";

/**
 *
 * @param feedback
 * @returns
 */

export const saveFeedback = async (feedback: FeedBack) => {
  const feedbacks = await new FeedbackModal(feedback.toJSON()).save();
  return new FeedBack(feedbacks);
};
