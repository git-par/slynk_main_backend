import { PromoCodeModal } from ".";
import { PromoCode } from ".";

/**
 * 
 * @param PromoCode class 
 * @returns 
 */

export const savePromoCode = async (promocode: PromoCode) => {
  const promocodes = await new PromoCodeModal(promocode.toJSON()).save();
  return new PromoCode(promocodes);
};
