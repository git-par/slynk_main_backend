import { connectDb } from "../../dbConnection";
import * as fs from "fs";
import * as dotenv from "dotenv";
import {
  AccountLink,
  getAllPopulatedAccountLinks,
  updateAccountLink,
} from "../../modules/accountLinks";
dotenv.config();

const ran = async () => {
  const success = [];
  const error = [];

  await connectDb()
    .then(async () => {
      const accLinks = await getAllPopulatedAccountLinks();

      //replace word im string
      // const str = "Hello world, welcome to the universe.";
      // const n = str.replace("world", "Universe");
      // console.log(n);

      for await (const item of accLinks) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore

        item.link.skippedWords.forEach((element: string) => {
          if (item.value.includes(element)) {
            item.value = item.value.replace(element, "");
          }
        });
        await updateAccountLink(
          new AccountLink({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            ...item,
          })
        )
          .then((result) => {
            success.push(result);
          })
          .catch((err) => error.push(err));
      }

      fs.writeFileSync(
        "./exports/PopulatedAccountLinksUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/PopulatedAccountLinksUtilityError.json",
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
