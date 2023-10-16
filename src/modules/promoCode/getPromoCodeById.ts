import { PromoCodeModal } from ".";
import { PromoCode } from ".";

/**
 * 
 * @param PromoCode class 
 * @returns 
 */
export const getPromoCodeById = async (_id: string) => {
    const promocode = await PromoCodeModal.findById(_id)
        .populate({ path: "couponId" });
    return promocode ? new PromoCode(promocode) : null;
};
