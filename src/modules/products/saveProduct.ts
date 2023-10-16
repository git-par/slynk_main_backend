import { ProductModal } from ".";
import { Products } from ".";

/**
 * 
 * @param product 
 * @returns 
 */
export const saveProduct = async (product: Products) => {
  const products = await new ProductModal(product.toJSON()).save();
  return new Products(products);
};
