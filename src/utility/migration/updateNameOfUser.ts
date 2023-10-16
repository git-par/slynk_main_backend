import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getUsers, updateUser, User } from "../../modules/user";
import { getAccountById } from "../../modules/account";
// import { getTag } from "../modules/tags/getTags";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const users = await getUsers();
      const success = [];
      const error = [];
      const notAcc = [];
      let a = 1
      for await (const value of users) {
        // if (!value.createdAt) {
        const acc = await getAccountById(value.accounts[0]?.toString());
        // if (acc) {
        console.log("***********************",++a);
        // await updateUser(
        // new User({
        //   ...value,
        console.log({ createdAt: acc.createdAt });
        // })
        success.push(
          new User({
            ...value,
            createdAt: acc.createdAt,
          })
        );
        // )
        // .then((result) => {
        // })
        // .catch((err) => error.push(err));
        // } else {
        // notAcc.push(value);
      }
      // }
      // }
      console.log("success", success.length);
      console.log("notAcc", notAcc.length);
      console.log("error", error.length);

      fs.writeFileSync(
        "./exports/updateUserNameUtilitySuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync(
        "./exports/updateUserNameNotAccUtilitySuccess.json",
        JSON.stringify(notAcc)
      );

      fs.writeFileSync(
        "./exports/updateUserNameUtilityError.json",
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
