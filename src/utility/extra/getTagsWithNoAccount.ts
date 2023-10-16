import { connectDb } from "../../dbConnection";
import { Tag as TagType } from "../../modules/tags";
import * as fs from "fs";
import { getTagsWithNoAccount } from "../../modules/tags/getTagsWithNoAccount";

const getTags = async () => {
  await connectDb()
    .then(async () => {
      const result = await getTagsWithNoAccount();
      //   let start;

      console.log(result);
      const success = result.map((value: TagType) => {
        return `https://slynk.app/${value.urlName}`;
      });
      // const success = [];
      const error = [];

      fs.writeFileSync(
        "./exports/getTagsWithNoAccountSuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync(
        "./exports/getTagsWithNoAccountError.json",
        JSON.stringify(error)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

getTags().then(() => {
  process.exit();
});
