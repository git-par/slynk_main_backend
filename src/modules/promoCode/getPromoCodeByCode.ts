import { PromoCodeModal } from ".";
import { PromoCode } from ".";

/**
 * 
 * @param PromoCode class 
 * @returns 
 */
export const getPromoCodeByCode = async (promotionCode: string) => {
    const promocode = await PromoCodeModal.findOne({ promotionCode });
    return promocode ? new PromoCode(promocode) : null;
};
