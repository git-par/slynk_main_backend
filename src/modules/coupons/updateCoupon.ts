import { CouponModal } from ".";
import { Coupon } from ".";

/**
 *
 * @param coupon class
 * @returns
 */

export const updateCoupon = async (coupon: Coupon) => {
    await CouponModal.findByIdAndUpdate(coupon._id, coupon.toJSON());
    return coupon;
};
