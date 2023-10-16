import { PromoCodeModal } from ".";
import { PromoCode } from ".";

/**
 * 
 *  
 * @returns 
 */
export const getPromoCodes = async (active?: boolean) => {
    let promocode
    if (active) {
        promocode = await PromoCodeModal.find({ active });
    }
    else {
        promocode = await PromoCodeModal.find()
            .populate({ path: "couponId" });
            // .populate({ path: "couponId", select: "couponId, couponName" });
    }
    return promocode ? promocode.map((item) => new PromoCode(item)) : null;
};
