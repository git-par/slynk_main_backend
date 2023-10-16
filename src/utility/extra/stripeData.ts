import { stripeInstance } from "../../helper/stripe";
import fs from "fs";

const stripeData = async () => {
  const { data } = await stripeInstance().charges.list({
    // customer: "cus_LYOhLX8JipxUmW",
    customer: "cus_LJpHJvjKRr6oyj",
  });
  fs.writeFileSync("./test.json", JSON.stringify(data));
};

stripeData().then(console.log);
