import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getUsers, updateUser, User } from "../../modules/user";
// import { getTag } from "../modules/tags/getTags";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const users = await getUsers();
      // const users = await getTag()
      console.log(users.length);
      const success = [];
      const error = [];

      for await (const value of users) {
        await updateUser(
          new User({
            ...value,
            // isAdminPro: true,
            // isPro: true,
            // subscriptionTill: new Date("2023-12-31T17:18:33.382+00:00"),
            isFirstVisit: {
              visitDate: value.createdAt
                ? new Date(value.createdAt)
                : new Date("2022-02-01T17:18:33.382+00:00"),
              //@ts-ignore
              value: value.isFirstVisit,
            },
            isPrivacyAccepted: {
              acceptedDate: value.createdAt
                ? new Date(value.createdAt)
                : new Date("2022-02-01T17:18:33.382+00:00"),
              //@ts-ignore
              value: value.isPrivacyAccepted,
            },
            // isFreePro: false,
            // isFreeUsed: false,
            // isInAppPro: false,
          })
        )
          .then((result) => {
            success.push(result);
          })
          .catch((err) => error.push(err));
      }

      fs.writeFileSync(
        "./exports/updateUserUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/updateUserUtilityError.json",
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
