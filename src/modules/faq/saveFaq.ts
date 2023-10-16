import { Faq } from ".";
import { FaqModal } from "./schema";

/**
 *
 * @param Faq Faq class
 * @returns created Faq
 */
export const saveFaq = async (faq: Faq) => {
  await new FaqModal(faq.toJSON()).save();
  return faq;
};
