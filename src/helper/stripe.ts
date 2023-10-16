// import Stripe from "stripe";
const stripe = require('stripe')
export const stripeInstance = () => stripe(
  process.env.STRIPE_SECRET,
  {
    apiVersion: "2020-08-27",
  }
);


