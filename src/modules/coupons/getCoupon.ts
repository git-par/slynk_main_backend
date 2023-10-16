import { CouponModal } from ".";
import { Coupon } from ".";

/**
 * 
 *  
 * @returns 
 */
export const getCoupons = async (active?: boolean) => {
    let coupons
    if (active) {
        coupons = await CouponModal.find({ active })
            .populate('promotionCode');
    }
    else {
        coupons = await CouponModal.find()
            .populate('promotionCode');
    }
    return coupons ? coupons.map((item) => new Coupon(item)) : null;
};
