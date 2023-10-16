import { MobileCouponModal } from ".";
import { MobileCoupon } from ".";

/**
 *
 * @param MobileCoupon class
 * @returns
 */
export const getMobileCouponByCouponId = async (couponCode: string) => {
  const mobileCoupon = await MobileCouponModal.findOne({ couponCode });
  return mobileCoupon ? new MobileCoupon(mobileCoupon) : null;
};
