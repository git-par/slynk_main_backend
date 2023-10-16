import { MobileCouponModal } from ".";
import { MobileCoupon } from ".";

/**
 *
 * @param MobileCoupon class
 * @returns
 */
export const saveMobileCoupon = async (mobileCoupon: MobileCoupon) => {
  const mobileCoupons = await new MobileCouponModal(
    mobileCoupon.toJSON()
  ).save();
  return new MobileCoupon(mobileCoupons);
};
