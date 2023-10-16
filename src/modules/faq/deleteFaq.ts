import { FaqModal } from "./schema";

/**
 * @param _id
 * delete Faq by _id
 */
export const deleteFaq = async (_id: string) => {
  await FaqModal.findByIdAndDelete(_id);
};
