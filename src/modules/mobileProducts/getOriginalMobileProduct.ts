import { MobileProductModal } from ".";

/**
 *
 * @param mobileProduct
 * @returns
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getOriginalMobileProducts = async () => {
  const mobileProducts = await MobileProductModal.find({
    productType: "ORIGINAL",
  });
  return mobileProducts;
};
