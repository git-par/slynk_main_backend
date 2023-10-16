import { Response } from "express";
import { log } from "winston";
import { getUserById, updateUser, User } from "../../modules/user";
import { Request } from "./../../request";
import { get, get as _get } from "lodash";
import { stripeInstance } from "../../helper/stripe";

export default class Controller {
  protected readonly paymentSuccess = async (req: Request, res: Response) => {
    try {
      // const sessionId = req.body.CHECKOUT_SESSION_ID;
      const sessionUser = req.authUser;

      // if (!sessionId) {
      //   res.status(422).json({ message: "Session not found" });
      // }

      const user = await getUserById(sessionUser._id);
      await updateUser(new User({ ...user.toJSON(), isPro: true }));
      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.log(error);
      log("error", "error in Payment Success", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly paymentWebhook = async (req: Request, res: Response) => {
    // const sig = req.headers["stripe-signature"];
    // const a = this.stripe.webhooks.constructEvent(
    //   req.body,
    //   sig,
    //   "whsec_d2afe5892542fe629f6ecceae13eca7cde5eb97bb12babb2946049af5cc6cb88"
    // );
    // console.log(a);
    // const customer = await Stripe..customers.create({
    //   description: 'My First Test Customer (created for API docs)',
    // });

    // this.stripe.customers;
    res.send();
  };

  protected readonly getCoupons = async (req: Request, res: Response) => {
    // const { data: productData } = await stripe.products.list({
    //   active: true,
    //   limit: 100,
    // });
    const { data: couponData } = await stripeInstance().coupons.list({
      limit: 100,
    });

    res.status(200).json(couponData);
  };

  protected readonly createCoupons = async (req: Request, res: Response) => {
    const product = await stripeInstance().products.create({
      name: req.body.name,
      active: req.body.active,
      caption: req.body.caption,
      type: "service",
      shippable: false,
    });

    const prices = await stripeInstance().prices.create({
      currency: "usd",
      active: true,
      product: product.id,
      expand: ["data.product"],
      recurring: {
        usage_type: "licensed",
        interval: "month",
        trial_period_days: 0,
      },
    });
    res.status(200).json(prices);
  };

  protected readonly pay = async (req: Request, res: Response) => {
    try {
      if (!req.body.productId) {
        res.status(422).json({ message: "Product id is required" });
        return;
      }
      const user = req.authUser;
      // const user = { stripeAccount: "cus_LY6t7EfRN24nlw" };
      // const customer = await stripeInstance().customers.create({
      //   shipping: {
      //     name: "Jenny Rosen",
      //     address: {
      //       line1: "510 Townsend St",
      //       postal_code: "98140",
      //       city: "San Francisco",
      //       state: "CA",
      //       country: "US",
      //     },
      //   },
      // });

      const { data: priceData } = await stripeInstance().prices.list({
        active: true,
        limit: 100,
        expand: ["data.product"],
        product: req.body.productId,
      });
      if (priceData.length !== 1) {
        res.status(422).json({ message: "Product id is required" });

        return;
      }
      console.log(priceData);
      const ephemeralKey = await stripeInstance().ephemeralKeys.create(
        { customer: user.stripeAccount },
        { apiVersion: "2020-08-27" }
      );
      const paymentIntent = await stripeInstance().paymentIntents.create({
        amount: priceData[0].unit_amount,
        currency: priceData[0].currency,
        customer: user.stripeAccount,
        description: get(priceData, "0.product.name"),
        metadata: {
          price: priceData[0].id,
          product: get(priceData, "0.product.id"),
        },
      });
      console.log(user.stripeAccount, ephemeralKey, paymentIntent);
      res.status(200).json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: user.stripeAccount,
      });
    } catch (e) {
      // Display error on client
      return res.send({ error: e.message });
    }
  };

  protected readonly cancelSub = async (req: Request, res: Response) => {
    try {
      console.log("cancle subscription");

      const user = req.authUser;
      console.log({ user });

      const { data } = await stripeInstance().subscriptions.list({
        customer: user.stripeAccount,
      });

      console.log(user.stripeAccount);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const subList = data.map((item: any) => {
        return {
          status: item.status,
          id: item.id,
        };
      });

      await Promise.allSettled(
        /* eslint-disable @typescript-eslint/no-explicit-any */
        subList.map(async (item: any) => {
          stripeInstance().subscriptions.update(item.id, {
            cancel_at_period_end: true,
          });
          // await stripeInstance().subscriptions.del(item.id);
        })
      );
      res.status(200).json({
        message: "Success",
      });
    } catch (e) {
      // Display error on client
      return res.send({ error: e.message });
    }
  };
}
