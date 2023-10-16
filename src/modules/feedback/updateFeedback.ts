import { FeedBack, FeedbackModal } from ".";

/**
 *
 * @param feedback
 * @returns updated feedback
 */

export const updateFeedback = async (feedback: FeedBack) => {
  await FeedbackModal.findByIdAndUpdate(feedback._id, feedback.toJSON());
  return new FeedBack(feedback);
};
