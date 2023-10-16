import { Response } from "express";
import { Request } from "../../../request";
import { log } from "winston";
import { get as _get, isNull, omitBy } from "lodash";
import * as Sentry from "@sentry/node";
import Joi from "joi";
import { stripeInstance } from "../../../helper/stripe";
import {
  Coupon,
  saveCoupon,
  getCouponByCouponId,
  updateCoupon,
  getCoupons,
  getCouponById,
  deleteCoupon,
} from "../../../modules/coupons";
import { deletePromoCode } from "../../../modules/promoCode";
// import { getPromoCodeByCode, PromoCode, savePromoCode } from "../../../modules/promocodes";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

// Sentry.init({
//     dsn: process.env.SENTRY_URL,

//     // We recommend adjusting this value in production, or using tracesSampler
//     // for finer control
//     tracesSampleRate: 1.0,
// });

// Sentry.configureScope((scope) => scope.setTransactionName("In Product"));

export default class Controller {
  private readonly couponsCreateSchema = Joi.object().keys({
    couponId: Joi.string().required(),
    couponName: Joi.string().required(),
    discountDuration: Joi.string()
      .required()
      .valid("once", "forever", "repeating"),
    discountType: Joi.string().required().valid("amount", "percent"),
    discountDurationInMonth: Joi.number().optional().allow(null),
    discountOff: Joi.number().required(),
    maxRedemptions: Joi.number().optional().allow(null),
    redemptionsTill: Joi.number().optional().allow(null),
    // promotionCode: Joi.string().required(),
  });
  private readonly couponsUpdateSchema = Joi.object().keys({
    couponName: Joi.string().required(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const coupons = await getCoupons();
      res.status(200).json(coupons);
    } catch (error) {
      console.log(error);
      // Sentry.captureException(error);
      log("error", "error in get coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getCouponFromStripe = async (
    req: Request,
    res: Response
  ) => {
    try {
      const allCoupon = await stripeInstance().coupons.list({
        limit: 100,
      });
      const couponArray = [];
      for await (const item of allCoupon.data) {
        const couponObject = {
          couponId: item.id,
          couponName: item.name,
          discountDuration: item.duration,
          discountType: item.percent_off ? "percent" : "amount",
          discountOff: item.percent_off
            ? item.percent_off
            : item.amount_off / 100,
          discountDurationInMonth: item.duration_in_months,
          maxRedemptions: item.max_redemptions,
          redemptionsTill: item.redeem_by,
        };
        couponArray.push(couponObject);
      }
      res.status(200).json(couponArray);
    } catch (error) {
      console.log(error);
      // Sentry.captureException(error);
      log("error", "error in getCouponFromStripe", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      console.log(payload);
      if (this.couponsCreateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.couponsCreateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.couponsCreateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }
      let coupon = null;
      coupon = await getCouponByCouponId(payloadValue.couponId);
      if (coupon) {
        res.status(422).json({
          message: "This coupon was already created.",
        });
        return;
      }

      if (payloadValue.discountType === "amount") {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const stripeCouponAmount: any = omitBy(
          {
            duration: payloadValue.discountDuration,
            id: payloadValue.couponId,
            amount_off: payloadValue.discountOff * 100,
            currency: "usd",
            max_redemptions: payloadValue.maxRedemptions,
            redeem_by: payloadValue.redemptionsTill,
            duration_in_months: payloadValue.discountDurationInMonth,
          },
          isNull
        );

        await stripeInstance().coupons.create(stripeCouponAmount);
      } else if (payloadValue.discountType === "percent") {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const stripeCouponPercent: any = omitBy(
          {
            duration: payloadValue.discountDuration,
            id: payloadValue.couponId,
            percent_off: payloadValue.discountOff,
            max_redemptions: payloadValue.maxRedemptions,
            redeem_by: payloadValue.redemptionsTill,
            duration_in_months: payloadValue.discountDurationInMonth,
          },
          isNull
        );
        await stripeInstance().coupons.create(stripeCouponPercent);
      }

      coupon = await saveCoupon(
        new Coupon({
          couponId: payloadValue.couponId,
          couponName: payloadValue.couponName,
          discountDuration: payloadValue.discountDuration,
          discountType: payloadValue.discountType,
          discountOff: payloadValue.discountOff,
          discountDurationInMonth: payloadValue.discountDurationInMonth,
          maxRedemptions: payloadValue.maxRedemptions,
          redemptionsTill: payloadValue.redemptionsTill,
          promotionCode: [],
        })
      );

      // let promotionCode = null
      // promotionCode = await getPromoCodeByCode(payloadValue.promotionCode)

      // if (promotionCode) {
      //     res.status(422).json({
      //         message: "This promocode was already created."
      //     })
      //     return
      // }
      // else {
      //     promotionCode = await stripeInstance().promotionCodes.create({
      //         coupon: payloadValue.couponId,
      //         code: payloadValue.promotionCode
      //     });

      //     promotionCode = await savePromoCode(new PromoCode({
      //         couponId: coupon._id,
      //         promotionCode: payloadValue.promotionCode,
      //         promotionCodeStripeId: promotionCode.id,
      //         active: true,
      //     }))

      //     await updateCoupon(new Coupon({
      //         ...coupon.toJSON(),
      //         promotionCode: [...coupon.promotionCode, promotionCode._id]
      //     }))
      // }

      res.status(200).json(coupon);
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

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const _id = req.params.couponId;
      const payload = req.body;

      if (!_id) {
        res.status(422).json({
          message: "This coupons is not exist.",
        });
      }

      if (this.couponsUpdateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.couponsUpdateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.couponsUpdateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }

      const coupon = await getCouponById(_id);

      if (!coupon) {
        res.status(422).json({
          message: "This coupons is not exist.",
        });
        return;
      }

      await stripeInstance().coupons.update(coupon.couponId, {
        name: payloadValue.couponName,
      });

      const updateableCoupon = await updateCoupon(
        new Coupon({
          ...coupon.toJSON(),
          couponName: payloadValue.couponName,
        })
      );

      res.status(200).json(updateableCoupon);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const couponId = req.params.couponId;
      if (!couponId) {
        res.status(422).json({
          message: "This coupons is not exist.",
        });
      }

      const coupon = await getCouponById(couponId);
      if (!coupon) {
        res.status(422).json({
          message: "This coupons is not exist.",
        });
        return;
      }
      const deletedCoupon = await stripeInstance().coupons.del(coupon.couponId);

      if (deletedCoupon.deleted) {
        for await (const promoCodeId of coupon.promotionCode) {
          await deletePromoCode(promoCodeId.toString());
        }

        await deleteCoupon(couponId);
        res.status(200).json({
          message: "This coupons is deleted successfully.",
        });
        return;
      } else {
        res.status(422).json({
          message: "This coupons is not deleted from stripe.",
        });
        return;
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in delete coupons", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
