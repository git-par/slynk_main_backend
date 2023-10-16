import { FaqModal } from ".";
import { Faq } from ".";

/**
 *
 * @param Faq class
 * @returns
 */
export const getFaqById = async (_id: string) => {
  const faq = await FaqModal.findById(_id).lean();
  return faq ? new Faq(faq) : null;
};
