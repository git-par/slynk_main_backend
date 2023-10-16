import { MobileProductModal } from ".";
import { MobileProducts } from ".";

/**
 *
 * @param mobileProduct
 * @returns
 */
export const getmobileProductsById = async (_id: string) => {
  const mobileProduct = await MobileProductModal.findById(_id);
  return mobileProduct ? new MobileProducts(mobileProduct) : null;
};
