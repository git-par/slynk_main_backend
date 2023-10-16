import { FeedBackType, FeedbackTypeModal } from ".";
/**
 *
 * @param feedbackType
 * @returns updated feedbackType
 */

export const updateFeedbackType = async (feedbackType: FeedBackType) => {
  await FeedbackTypeModal.findByIdAndUpdate(
    feedbackType._id,
    feedbackType.toJSON()
  );
  return new FeedBackType(feedbackType);
};
