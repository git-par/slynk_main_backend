import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
// import { updateUser, User } from "../modules/user";
import { deleteAccount, getLiteAccountsForAdmin } from "../../modules/account";
// import { getTag } from "../modules/tags/getTags";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const acc = await getLiteAccountsForAdmin();
      // const users = await getTag()
      console.log(acc.length);

      const success = [];
      const error = [];

      //   success.push(acc);
      for await (const value of acc) {
        if (value.user === "undefined" || value.user === null || !value.user) {
          await deleteAccount(value._id)
            .then((result) => {
              success.push(value);
            })
            .catch((err) => error.push(err));
        }
      }

      fs.writeFileSync(
        "./exports/TAG_UtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/TAG_UtilityError.json",
        JSON.stringify(error)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

ran().then(() => {
  process.exit();
});
