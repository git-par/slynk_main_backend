import { Response } from "express";
import { Request } from "../../../request";
import { log } from "winston";
import { stripeInstance } from "../../../helper/stripe";
import { get as _get } from "lodash";
import {
  getProducts,
  getProductsById,
  Products,
  saveProduct,
  updateProduct,
} from "../../../modules/products";

import * as Sentry from "@sentry/node";
import Joi from "joi";

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
  protected readonly productsCreateSchema = Joi.object().keys({
    productName: Joi.string().required(),
    productDesc: Joi.string().optional().allow(null, ""),
    active: Joi.boolean().required(),
    productType: Joi.string().required().valid("SUBSCRIPTION", "NFC"),
    currentPrice: Joi.number().optional(),
    discountPrice: Joi.number().required(),
    priceInterval: Joi.string().required(),
    priceIntervalCount: Joi.number().optional(),
  });

  protected readonly productsUpdateSchema = Joi.object().keys({
    productName: Joi.string().optional(),
    productDesc: Joi.string().optional().allow(null, ""),
    active: Joi.boolean().optional(),
    discountPrice: Joi.number().optional(),
    // discountPrice: Joi.number().optional(),
    // priceInterval: Joi.string().optional(),
    // priceIntervalCount: Joi.number().optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (_id) {
        const product = await getProductsById(_id);
        if (!product) {
          res.status(422).json({ message: "Invalid Product." });
          return;
        }
        res.status(200).json(product);
        return;
      }
      const products = await getProducts({
        active: true,
        productType: req.query.productType,
      });
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get products", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly admin_get = async (req: Request, res: Response) => {
    try {
      const products = await getProducts();
      res.status(200).json(products);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get products", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (this.productsCreateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.productsCreateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.productsCreateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
      let product: any;
      product = await stripeInstance().products.create({
        name: payloadValue.productName,
        active: payloadValue.active,
        description:
          payloadValue.productDesc !== "" || !payloadValue.productDesc
            ? "Description"
            : payloadValue.productDesc,
        type: "service",
        shippable: false,
      });

      const prices = await stripeInstance().prices.create({
        currency: "usd",
        unit_amount: payloadValue.discountPrice,
        active: true,
        product: product.id,
        recurring: {
          usage_type: "licensed",
          interval: payloadValue.priceInterval,
          interval_count: payloadValue.priceIntervalCount,
          trial_period_days: 0,
        },
      });

      product = await stripeInstance().products.update(product.id, {
        default_price: prices.id,
      });
      product = new Products({
        productId: product.id,
        productName: product.name,
        productDesc: payloadValue.productDesc ? payloadValue.productDesc : "",
        currentPrice: payloadValue.currentPrice,
        discountPrice: payloadValue.discountPrice,
        priceIntervalCount: payloadValue.priceIntervalCount,
        priceId: prices,
        active: payloadValue.active,
        productType: payloadValue.productType,
        priceInterval: payloadValue.priceInterval,
      });

      await saveProduct(product);
      res.status(200).json(product);
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

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      const payload = req.body;
      // let product = null
      let price = null;

      if (!_id) {
        res.status(422).json({ message: "Invalid Product." });
        return;
      }
      const product = await getProductsById(_id);
      if (!product) {
        res.status(422).json({ message: "Invalid Product." });
        return;
      }

      if (this.productsUpdateSchema.validate(payload).error) {
        res.status(422).json({
          message: this.productsUpdateSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.productsUpdateSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }

      if (payloadValue.currentPrice) {
        price = await stripeInstance().prices.create({
          currency: "usd",
          unit_amount: payloadValue.currentPrice,
          active: true,
          product: product.productId,
          recurring: {
            usage_type: "licensed",
            interval: payloadValue.priceInterval,
            trial_period_days: 0,
          },
        });
      }

      if (price) {
        await stripeInstance().products.update(product.productId, {
          name: payloadValue.productName || product.productName,
          active: payloadValue.active && product.active,
          description: payloadValue.description || product.productDesc,
          default_price: price.id,
        });
        await stripeInstance().prices.update(product.priceId.id, {
          active: false,
        });
        const updatedProduct = await updateProduct(
          new Products({
            ...product.toJSON(),
            ...payloadValue,
            priceId: price,
          })
        );
        res.status(200).json(updatedProduct);
      } else {
        await stripeInstance().products.update(product.productId, {
          name: payloadValue.productName || product.productName,
          active: payloadValue.active,
          description: payloadValue.description || product.productDesc,
        });
        const updatedProduct = await updateProduct(
          new Products({
            ...product.toJSON(),
            ...payloadValue,
          })
        );
        res.status(200).json(updatedProduct);
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update products", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
