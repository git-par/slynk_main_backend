import { ProductModal } from ".";
import { Products } from ".";
/**
 *
 * @param product class
 * @returns
 */

export const updateProduct = async (product: Products) => {
    await ProductModal.findByIdAndUpdate(product._id, product.toJSON());
    return product;
};
