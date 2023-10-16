import { FaqModal } from ".";
import { Faq } from ".";

export const getFaq = async () => {
  const faq = await FaqModal.find().lean();
  return faq ? faq.map((item) => new Faq(item)) : null;
};
