import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getImage, Image, updateImage } from "../../modules/image";
dotenv.config();

const ran = async () => {
  const success = [];
  const error = [];
  await connectDb()
    .then(async () => {
      const image = await getImage();
      image.map(async (item, index) => {
        console.log(index);
        await updateImage(
          new Image({
            ...item,
            mimeType: "",
          })
        )
          .then((result) => {
            success.push(result);
            console.log(result);
          })
          .catch((err) => {
            error.push(err);
            console.log(err);
          });
      });

      for await (const value of image) {
        const i = await updateImage(
          new Image({
            ...value,
            mimeType: "",
          })
        )
          .then((result) => {
            success.push(result);
          })
          .catch((err) => error.push(err));

        console.log(i);
      }

      fs.writeFileSync(
        "./exports/fetchImageUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/fetchImageUtilityError.json",
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
