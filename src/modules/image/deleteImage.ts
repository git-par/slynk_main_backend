import { Storage } from "@google-cloud/storage";
import { Image } from ".";
import { ImageModel } from "./schema";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 *
 * @param image image class
 */
export const deleteImage = async (image: Image) => {
  // const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
  // await bucket
  //   .file(`images/${image._id}/${image.url.split("/").pop()}`)
  //   .delete();
  await ImageModel.findByIdAndDelete(image._id.toString());
};
