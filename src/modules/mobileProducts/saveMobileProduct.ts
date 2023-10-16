import { MobileProductModal } from ".";
import { MobileProducts } from ".";

/**
 *
 * @param mobileProduct
 * @returns
 */
export const saveMobileProduct = async (mobileProduct: MobileProducts) => {
  const mobileProducts = await new MobileProductModal(
    mobileProduct.toJSON()
  ).save();
  return new MobileProducts(mobileProducts);
};
