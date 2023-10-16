import { MobileProductModal } from ".";
import { MobileProducts } from ".";
/**
 *
 * @param product class
 * @returns
 */

export const updateMobileProduct = async (mobileProduct: MobileProducts) => {
  await MobileProductModal.findByIdAndUpdate(
    mobileProduct._id,
    mobileProduct.toJSON()
  );
  return mobileProduct;
};
