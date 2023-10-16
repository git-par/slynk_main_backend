import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getAllPkPass, PkPass } from "../../modules/pkPass";
import { updatePkPass } from "../../modules/pkPass/updatePkPass";
dotenv.config();

const ran = async () => {
  console.log("********")

  await connectDb()
    .then(async () => {
      const passes = await getAllPkPass();
      // const users = await getTag()
      console.log(passes.length);
      const success = [];
      const error = [];

      for await (const value of passes) {
        await updatePkPass(
          new PkPass({
            ...value,
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
