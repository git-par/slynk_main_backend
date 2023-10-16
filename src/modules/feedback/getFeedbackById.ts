import { FeedbackModal } from ".";
import { FeedBack } from ".";

/**
 *
 * @param FeedBack class
 * @returns
 */
export const getFeedBackById = async (_id: string) => {
  const feedBack = await FeedbackModal.findById(_id).lean();
  return feedBack ? new FeedBack(feedBack) : null;
};
