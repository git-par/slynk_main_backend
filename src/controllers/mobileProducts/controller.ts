import { Response } from "express";
import { Request } from "../../request";
import { log } from "winston";
import { get as _get } from "lodash";

import * as Sentry from "@sentry/node";
import Joi, { isError } from "joi";
import {
  getMobileProductByPrice,
  getMobileProducts,
  getmobileProductsById,
  getOriginalMobileProducts,
  MobileProducts,
  saveMobileProduct,
  updateMobileProduct,
} from "../../modules/mobileProducts";
import { getMobileProductByProductId } from "../../modules/mobileProducts/getMobileProductByProductId";
import { getMobileCouponByCouponId } from "../../modules/mobileCoupons";

export default class Controller {
  private readonly productsCreateSchema = Joi.object().keys({
    platform: Joi.string().required(),
    productId: Joi.string().required(),
    // .external(async (v: string) => {
    //   const productId = await getMobileProductByProductId(v);
    //   if (productId) {
    //     throw new Error("Using This ProductId Product is Already Created.");
    //   }
    //   return v;
    // }),
    productName: Joi.string().required(),
    productDesc: Joi.string().required(),
    originalPrice: Joi.number().required(),
    dummyPrice: Joi.number().optional(),
    productType: Joi.string().required(),
    active: Joi.boolean().optional(),
  });
  private readonly productsUpdateSchema = Joi.object().keys({
    productId: Joi.string().optional(),
    // .external(async (v: string) => {
    //   const productId = await getMobileProductByProductId(v);
    //   if (productId) {
    //     throw new Error("Using This ProductId Product is Already Created.");
    //   }
    //   return v;
    // }),
    productName: Joi.string().optional(),
    productDesc: Joi.string().optional(),
    originalPrice: Joi.number().optional(),
    dummyPrice: Joi.number().optional(),
    platform: Joi.string().optional(),
    productType: Joi.string().optional(),
    active: Joi.boolean().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.productsCreateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });

      if (!payloadValue) {
        return;
      }

      const productId = await getMobileProductByProductId(
        payloadValue.productId,
        payloadValue.platform
      );

      if (productId) {
        res.status(422).json({
          message: "Using This ProductId Product is Already Created.",
        });
        return;
      }
      await saveMobileProduct(new MobileProducts(payloadValue));
      res.status(200).json(payloadValue);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create product", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const product = await getMobileProducts();
      res.status(200).json(product);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getOriginalProduct = async (
    req: Request,
    res: Response
  ) => {
    try {
      const platform = req.params.platform;
      const data = [];

      if (platform === "IOS") {
        const product = await getOriginalMobileProducts();
        product.map((i) => {
          if (i.platform == "IOS") {
            data.push(i);
          }
        });
      }
      if (platform === "ANDROID") {
        const product = await getOriginalMobileProducts();
        product.map((i) => {
          if (i.platform == "ANDROID") {
            data.push(i);
          }
        });
      }
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(422).json({ message: "Invalid Product." });
        return;
      }
      const product = await getmobileProductsById(id);
      if (!product) {
        res.status(422).json({ message: "Invalid Product Id." });
        return;
      }

      const payload = req.body;
      const payloadValue = await this.productsUpdateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });

      if (!payloadValue) {
        return;
      }
      const updatedProduct = new MobileProducts({
        ...product.toJSON(),
        ...payloadValue,
      });

      const productId = await getMobileProductByProductId(
        updatedProduct.productId,
        updatedProduct.platform
      );

      if (productId._id != product._id) {
        if (productId) {
          res.status(422).json({
            message: "Using This ProductId Product is Already Created.",
          });
          return;
        }
      }

      await updateMobileProduct(updatedProduct);

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly findDiscountProduct = async (
    req: Request,
    res: Response
  ) => {
    try {
      const couponCode = req.params;
      const payload = req.body;

      const coupon = await getMobileCouponByCouponId(couponCode.name);
      if (!coupon) {
        res.status(422).json({ message: "Invalid Coupon." });
        return;
      }

      const product = await getMobileProductByProductId(
        payload.productId,
        payload.platform
      );
      if (!product) {
        res.status(422).json({ message: "Invalid Product." });
        return;
      }

      const discountPrice =
        product.originalPrice - (coupon.discount / 100) * product.originalPrice;

      const discountProduct = await getMobileProductByPrice(
        discountPrice,
        product.platform
      );

      if (!discountProduct) {
        throw new Error("Product Is Missing.");
      }

      const findProduct = coupon.mobileProductId.includes(product._id);

      if (findProduct === false) {
        res
          .status(422)
          .json({ message: "This coupon is not applicable to this product." });
      } else {
        res.status(200).json({ product, discountProduct });
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in finding DiscountProduct", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
