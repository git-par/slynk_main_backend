import { ProductModal } from ".";
import { Products } from ".";

/**
 * 
 * @param product 
 * @returns 
 */
export const getProductsById = async (_id: string) => {
    const product = await ProductModal.findById(_id);
    return product ? new Products(product) : null;
};
