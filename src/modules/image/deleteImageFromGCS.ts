// import { log } from "winston";

import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

export const deleteImageFromGCS = async (
  filePath: string,
  _id: string,
  name: string
): Promise<string> => {
  // const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
  // const gcsFilePath = `images/${_id}/image.${name.split(".").pop()}`;
  // const file = bucket.file(gcsFilePath);

  // await bucket.upload(filePath, {
  //   destination: file,
  // });

  // // await bucket.file(gcsFilePath).makePublic();
  // return bucket.file(gcsFilePath).publicUrl();
  return 'true'
};
