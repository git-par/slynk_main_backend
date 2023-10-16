import { Response } from "express";
import { Request } from "../../request";
import { log } from "winston";
import { get as _get } from "lodash";
import * as Sentry from "@sentry/node";
import Joi, { isError } from "joi";
import moment from "moment";
import {
  getMobileCouponByCouponId,
  getMobileCouponById,
  getMobileCoupons,
  MobileCoupon,
  saveMobileCoupon,
  updateMobileCoupon,
} from "../../modules/mobileCoupons";
import {
  getMobileProductByPrice,
  getmobileProductsById,
} from "../../modules/mobileProducts";

export default class Controller {
  private readonly couponsCreateSchema = Joi.object().keys({
    couponCode: Joi.string()
      .required()
      .external(async (v: string) => {
        const couponCode = await getMobileCouponByCouponId(v);
        if (couponCode) {
          throw new Error("Using This CouponCode Coupon Is Already Created.");
        }
        return v;
      }),
    expDate: Joi.string()
      .required()
      .external(async (v: number) => {
        const currDate = moment().format("Y-MM-DD");
        const newV = moment(v).format("Y-MM-DD");

        if (newV < currDate) {
          throw new Error("Invalid Date.");
        }
        return v;
      }),
    discount: Joi.number().required(),
    mobileProductId: Joi.array().required().allow(null),
    maxRedemptions: Joi.number().required(),
  });

  private readonly couponsUpdateSchema = Joi.object().keys({
    couponCode: Joi.string().optional(),
    // .external(async (v: string) => {
    //   const couponCode = await getMobileCouponByCouponId(v);
    //   if (couponCode) {
    //     throw new Error("Using This CouponCode Coupon Is Already Created.");
    //   }
    //   return v;
    // }),
    expDate: Joi.string()
      .optional()
      .external(async (v: number) => {
        const currDate = moment().format("Y-MM-DD");
        const newV = moment(v).format("Y-MM-DD");

        if (newV < currDate) {
          throw new Error("Invalid Date.");
        }
        return v;
      }),
    discount: Joi.number().optional(),
    mobileProductId: Joi.array().optional().allow(null),
    maxRedemptions: Joi.number().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.couponsCreateSchema
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

      await Promise.all(
        payloadValue.mobileProductId.map(async (i) => {
          const mobileProduct = await getmobileProductsById(i);
          const devicetype = mobileProduct.platform;
          const price = mobileProduct.originalPrice;

          const discountPrice = price - (payloadValue.discount / 100) * price;

          const product = await getMobileProductByPrice(
            discountPrice,
            devicetype
          );
          if (!product) {
            throw new Error("Product Is Missing.");
          }
          if (devicetype !== product.platform) {
            throw new Error("Product Is Missing.");
          }
        })
      );

      await saveMobileCoupon(new MobileCoupon(payloadValue));
      res.status(200).json(payloadValue);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      Sentry.captureException(error);
      log("error", "error in create coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const coupons = await getMobileCoupons();
      res.status(200).json(coupons);
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
        res.status(422).json({ message: "Invalid Coupons." });
        return;
      }
      const coupon = await getMobileCouponById(id);
      if (!coupon) {
        res.status(422).json({ message: "Invalid Coupons." });
        return;
      }

      const payload = req.body;
      const payloadValue = await this.couponsUpdateSchema
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

      const couponCode = await getMobileCouponByCouponId(
        payloadValue.couponCode
      );

      if (couponCode._id.toString() !== id) {
        res.status(422).json({
          message: "Using This CouponCode Coupon Is Already Created.",
        });
        return;
      }

      const updatedCoupon = new MobileCoupon({
        ...coupon.toJSON(),
        ...payloadValue,
      });

      await Promise.all(
        updatedCoupon.mobileProductId.map(async (i: string) => {
          const mobileProduct = await getmobileProductsById(i);
          const devicetype = mobileProduct.platform;
          const price = mobileProduct.originalPrice;

          const discountPrice = price - (updatedCoupon.discount / 100) * price;

          const product = await getMobileProductByPrice(
            discountPrice,
            devicetype
          );
          if (!product) {
            res.status(422).json({
              message: "Product Is Missing.",
            });
            return;
          }
          if (devicetype !== product.platform) {
            res.status(422).json({
              message: "Product Is Missing.",
            });
            return;
          }
        })
      );

      await updateMobileCoupon(updatedCoupon);

      res.status(200).json(updatedCoupon);
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
}
