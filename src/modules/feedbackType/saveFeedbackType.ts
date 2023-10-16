import { FeedBackType, FeedbackTypeModal } from ".";

/**
 *
 * @param feedbackType
 * @returns
 */

export const saveFeedbackType = async (feedbackType: FeedBackType) => {
  const feedbacksType = await new FeedbackTypeModal(
    feedbackType.toJSON()
  ).save();
  return new FeedBackType(feedbacksType);
};
