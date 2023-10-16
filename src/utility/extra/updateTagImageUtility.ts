import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getTagsByDetails } from "../../modules/tags/getTagsByDetails";
import { Tag, updateTags } from "../../modules/tags";
// import { getTag } from "../modules/tags/getTags";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const data = { color: "WT", type: "RE" };
      const tags = await getTagsByDetails(data);
      // const tags = await getTag()
      console.log(tags.length);
      const success = [];
      const error = [];
      const tagURL = [];

      for await (const value of tags) {
        await updateTags(
          new Tag({
            ...value,
            tagImage: "638b990ac58878052efdc697",
          })
        )
          .then((result) => {
            console.log("success", success.length);
            tagURL.push(result.urlName);
            success.push(result);
          })
          .catch((err) => error.push(err));
      }

      fs.writeFileSync(
        "./exports/updateTagImageUtilitySuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync("./exports/tagURL.json", JSON.stringify(tagURL));
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
