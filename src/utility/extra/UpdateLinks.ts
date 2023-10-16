import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getLinks, Links, updateLink } from "../../modules/links";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const links = await getLinks();

      console.log(links.length);
      const success = [];
      const error = [];


      for await (const value of links) {
        console.log(value._id)
        await updateLink(
          new Links({
            ...value,
            category: [...value.category, "6306fd909ec82f1eed8d48cd"]
          })
        )
          .then((result) => {
            success.push(result);
          })
          .catch((err) => error.push(err));
      }

      fs.writeFileSync(
        "./exports/updateTagImageUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/updateTagImageUtilityError.json",
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
