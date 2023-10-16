import { MobileProductModal } from ".";
import { MobileProducts } from ".";

/**
 *
 * @param MobileProduct class
 * @returns
 */
export const getMobileProductByProductId = async (
  productId: string,
  platform: string
) => {
  const mobileProduct = await MobileProductModal.findOne({
    productId,
    platform,
  });
  return mobileProduct ? new MobileProducts(mobileProduct) : null;
  // return mobileProduct;
};
