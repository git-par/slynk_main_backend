import { Response } from "express";
import { Request } from "../../../request";
import { log } from "winston";
import { get as _get } from "lodash";
import * as Sentry from "@sentry/node";
import Joi from "joi";
import { stripeInstance } from "../../../helper/stripe";
import {
  Coupon,
  getCouponByCouponId,
  updateCoupon,
} from "../../../modules/coupons";
import {
  deletePromoCode,
  getPromoCodeByCode,
  getPromoCodeById,
  getPromoCodes,
  PromoCode,
  savePromoCode,
  updatePromoCode,
} from "../../../modules/promoCode";

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
  protected readonly promoCodeCreateSchema = Joi.object().keys({
    couponId: Joi.string().required(),
    promotionCode: Joi.string().required(),
  });

  protected readonly PromocdeUpdateSchema = Joi.object().keys({
    active: Joi.boolean().required(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const promoCode = await getPromoCodes();
      res.status(200).json(promoCode);
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

  protected readonly stripeGet = async (req: Request, res: Response) => {
    try {
      const _id = req.params.promoCodeId;

      if (!_id) {
        res.status(422).json({
          message: "This Promocode is not exist.",
        });
        return;
      }

      const promocode = await getPromoCodeByCode(_id);

      if (!promocode) {
        res.status(422).json({
          message: "This Promocode is not exist.",
        });
        return;
      }
      console.log(promocode, _id);
      await stripeInstance()
        .promotionCodes.retrieve(promocode.promotionCodeStripeId)
        .then((result) => {
          if (!result.active) {
            res.status(422).json({
              message: "This Promocode is not exist.",
            });
            return;
          }

          res.status(200).json(result);
          return;
        })
        .catch((error) => {
          console.log(error);
          res.status(422).json({
            message: "This Promocode is not exist.",
          });
          return;
        });

      // if (!promotionCode) {
      //     res.status(422).json({
      //         message: "This Promocode is not exist."
      //     })
      // }
    } catch (error) {
      console.log(error);
      // Sentry.captureException(error);
      log("error", "error in get coupons", error);
      res.status(500).json({
        message: _get(error, "message"),
        error: "Hmm... Something went wrong. Please try again later.",
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (this.promoCodeCreateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.promoCodeCreateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.promoCodeCreateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }
      const coupon = await getCouponByCouponId(payloadValue.couponId);
      if (!coupon) {
        res.status(422).json({
          message: "This coupons is not exist.",
        });
        return;
      }

      let promotionCode = null;
      promotionCode = await getPromoCodeByCode(payloadValue.promotionCode);

      if (promotionCode) {
        res.status(422).json({
          message: "This promocode was already created.",
        });
        return;
      }

      promotionCode = await stripeInstance().promotionCodes.create({
        coupon: payloadValue.couponId,
        code: payloadValue.promotionCode,
      });

      promotionCode = await savePromoCode(
        new PromoCode({
          couponId: coupon._id,
          promotionCode: payloadValue.promotionCode,
          promotionCodeStripeId: promotionCode.id,
          active: true,
        })
      );

      await updateCoupon(
        new Coupon({
          ...coupon.toJSON(),
          promotionCode: [...coupon.promotionCode, promotionCode._id],
        })
      );

      promotionCode = await getPromoCodeById(promotionCode._id);

      res.status(200).json(promotionCode);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create promocode", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const _id = req.params.promoCodeId;
      const payload = req.body;

      if (!_id) {
        res.status(422).json({
          message: "This Promocode is not exist.",
        });
      }

      if (this.PromocdeUpdateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.PromocdeUpdateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.PromocdeUpdateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }

      const promocode = await getPromoCodeById(_id);

      if (!promocode) {
        res.status(422).json({
          message: "This Promocode is not exist.",
        });
      }

      await stripeInstance().promotionCodes.update(
        promocode.promotionCodeStripeId,
        { active: payloadValue.active }
      );

      const updateableCoupon = await updatePromoCode(
        new PromoCode({
          ...promocode.toJSON(),
          active: payloadValue.active,
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
      const promoCodeId = req.params.promoCodeId;
      console.log(promoCodeId);

      if (!promoCodeId) {
        res.status(422).json({
          message: "Invalid promoCodeId.",
        });
      }

      const promoCode = await getPromoCodeById(promoCodeId);
      if (!promoCode) {
        res.status(422).json({
          message: "This promoCode is not exist.",
        });
        return;
      }

      //   const deletedCoupon = await stripeInstance().coupons.del(
      //     promoCode.couponId
      //   );

      //   if (deletedCoupon.deleted) {
      //@ts-ignore
      // for await (const promoCodeId of promoCode) {
      //   await deletePromoCode(promoCodeId);
      // }
      await deletePromoCode(promoCodeId);

      res.status(200).json({
        message: "This promoCode is deleted successfully.",
      });
      return;
      //   } else {
      //     res.status(422).json({
      //       message: "This promoCode is not deleted from stripe.",
      //     });
      //     return;
      //   }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in delete promoCode", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
