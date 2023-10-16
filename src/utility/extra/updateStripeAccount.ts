import { connectDb } from "../../dbConnection";
import { getUsers, updateUser, User } from "../../modules/user";
import stripe from "../../stripe";

import * as dotenv from "dotenv";
dotenv.config();
const addStripeAccount = async (user: User) => {
  const stripeAccount = await stripe.customers.create(
    {
      metadata: { userId: user._id },
      email: user.email,
    },
    {
      apiKey: process.env.STRIPE_SECRET,
    }
  );
  user.stripeAccount = stripeAccount.id;
  console.log(user);
  return updateUser(user);
};

const updateStripeAccount = async () => {
  await connectDb();
  const users = await getUsers();
  // users.filter((user) => user.stripeAccount === undefined)
  // await Promise.all((addStripeAccount));
  const chunkSize = 10;
  for (let i = 100; i < users.length; i++) {
    await addStripeAccount(users[i]);
  }
  console.log(users.length);
};

updateStripeAccount().then(() => {
  process.exit();
});
