import { MobileCouponModal } from ".";
import { MobileCoupon } from ".";

/**
 *
 * @param MobileCoupon class
 * @returns
 */
export const getMobileCouponById = async (_id: string) => {
  const mobileCoupon = await MobileCouponModal.findById(_id);
  return mobileCoupon ? new MobileCoupon(mobileCoupon) : null;
};
