import { FaqModal } from ".";
import { Faq } from ".";

/**
 *
 * @param Faq class
 * @returns
 */

export const updateFaq = async (faq: Faq) => {
  await FaqModal.findByIdAndUpdate(faq._id, faq.toJSON());
  return faq;
};
