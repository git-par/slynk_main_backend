import { PromoCodeModal } from "./schema";

/**
 *
 * @param promoCodeId
 */
export const deletePromoCode = async (promoCodeId: string) => {
  await PromoCodeModal.findByIdAndDelete(promoCodeId);
};
