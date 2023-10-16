import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { getImage, Image, updateImage } from "../../modules/image";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const image = await getImage();
      // console.log(image.length);
      // console.log(image[0]._id.toString());
      // console.log(image[0]);
      const success = [];
      const error = [];
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

      // console.log("********************");
      // console.log(
      //   new Image({
      //     ...image[0],
      //     mimeType: "",
      //   })
      // );
      // console.log("********************");
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
        "./exports/imageUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/imageUtilityError.json",
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
