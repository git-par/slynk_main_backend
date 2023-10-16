// import { log } from "winston";

import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const deleteLogoFromGCS = async (

  name: string
): Promise<boolean> => {
  console.log(name)
  // await storage
  //   .bucket(process.env.GOOGLE_CLOUD_BUCKET)
  //   .file("images/61cbf7c1fd4d09ee9ae8a408/image.jpg")
  //   .delete();
  return true

};
