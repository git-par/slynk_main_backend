import { CouponModal } from ".";
import { Coupon } from ".";

/**
 * 
 * @param Coupon class 
 * @returns 
 */
export const saveCoupon = async (coupon: Coupon) => {
  const coupons = await new CouponModal(coupon.toJSON()).save();
  return new Coupon(coupons);
};
