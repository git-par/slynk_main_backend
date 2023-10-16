import { MobileCouponModal } from ".";
import { MobileCoupon } from ".";

/**
 *
 *
 * @returns
 */
export const getMobileCoupons = async (active?: boolean) => {
  let mobileCoupons;
  if (active) {
    mobileCoupons = await MobileCouponModal.find({ active });
  } else {
    mobileCoupons = await MobileCouponModal.find();
  }
  return mobileCoupons
    ? mobileCoupons.map((item) => new MobileCoupon(item))
    : null;
};
