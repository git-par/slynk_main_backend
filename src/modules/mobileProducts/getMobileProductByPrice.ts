import { MobileProductModal } from ".";
import { MobileProducts } from ".";

/**
 *
 * @param MobileProduct class
 * @returns
 */
export const getMobileProductByPrice = async (
  originalPrice: number,
  platform: string
) => {
  const mobileProduct = await MobileProductModal.findOne({
    originalPrice,
    platform,
  });
  return mobileProduct ? new MobileProducts(mobileProduct) : null;
};
