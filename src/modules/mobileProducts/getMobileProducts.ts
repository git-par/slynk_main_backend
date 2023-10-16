import { MobileProductModal } from ".";

/**
 *
 * @param mobileProduct
 * @returns
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getMobileProducts = async () => {
  const mobileProducts = await MobileProductModal.find();
  return mobileProducts;
};
