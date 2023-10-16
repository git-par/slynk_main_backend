import { CouponModal } from ".";
import { Coupon } from ".";

/**
 * 
 * @param Coupon class 
 * @returns 
 */
export const getCouponByCouponId = async (couponId: string) => {
    const coupon = await CouponModal.findOne({ couponId });
    return coupon ? new Coupon(coupon) : null;
};
