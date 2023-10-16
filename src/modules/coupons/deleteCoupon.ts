import { CouponModal } from "./schema";

/**
 *
 * @param couponId
 */
export const deleteCoupon = async (couponId: string) => {
  await CouponModal.findByIdAndDelete(couponId);
};
