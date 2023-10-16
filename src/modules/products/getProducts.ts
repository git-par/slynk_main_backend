import { ProductModal } from ".";
import { Products } from ".";

/**
 * 
 * @param product 
 * @returns 
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getProducts = async (data?: any) => {
    let products
    if (data) {
        products = await ProductModal.find({
            active: data.active,
            productType: data.productType
        }).sort({ _id: -1 });
    }
    else {
        products = await ProductModal.find();
    }
    return products ? products.map((item) => new Products(item)) : null;
};
