import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getLinks } from "../../modules/links";
import {
  getLinksCategoryById,
  LinkCategory,
  updateLinksCategory,
} from "../../modules/linksCategory";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const links = await getLinks();
      const linkCategory = await getLinksCategoryById(
        "6306fd909ec82f1eed8d48cd"
      );

      const linkArr = links.map((link) => link._id);

      // const users = await getTag()
      console.log(links.length);
      const success = [];
      const error = [];

      await updateLinksCategory(
        new LinkCategory({
          ...linkCategory,
          links: linkArr,
        })
      );

      // for await (const value of links) {
      //   await updateLinksCategory(
      //     new linksCategory({
      //       ...value,
      //       isAdminPro: false,
      //       isInAppPro: false,
      //       subscriptionTill: new Date(),
      //     })
      //   )
      //     .then((result) => {
      //       success.push(result);
      //     })
      //     .catch((err) => error.push(err));
      // }

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
