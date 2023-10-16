import { CouponModal } from ".";
import { Coupon } from ".";

/**
 * 
 * @param Coupon class 
 * @returns 
 */
export const getCouponById = async (_id: string) => {
    const coupon = await CouponModal.findById(_id);
    return coupon ? new Coupon(coupon) : null;
};
