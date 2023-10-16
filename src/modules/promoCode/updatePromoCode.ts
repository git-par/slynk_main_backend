import { PromoCodeModal } from ".";
import { PromoCode } from ".";

/**
 * 
 * @param PromoCode class 
 * @returns 
 */

export const updatePromoCode = async (promocode: PromoCode) => {
    await PromoCodeModal.findByIdAndUpdate(promocode._id, promocode.toJSON());
    return promocode;
};
