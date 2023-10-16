import { MobileCouponModal } from ".";
import { MobileCoupon } from ".";

/**
 *
 * @param mobileCoupon class
 * @returns
 */

export const updateMobileCoupon = async (mobileCoupon: MobileCoupon) => {
  await MobileCouponModal.findByIdAndUpdate(
    mobileCoupon._id,
    mobileCoupon.toJSON()
  );
  return mobileCoupon;
};
