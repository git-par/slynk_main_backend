// import { log } from "winston";

import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const uploadLogoToGCS = async (
  fileName: string,
  filePath: string,
  _id: string,
  name: string
): Promise<string> => {
  console.log(name)
  const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
  const gcsFilePath = `logo/${_id}/${fileName}`;
  // const gcsFilePath = `logo/${_id}/${fileName}.${name.split(".").pop()}`;
  const file = bucket.file(gcsFilePath);

  await bucket.upload(filePath, {
    destination: file,
  });

  // await bucket.file(gcsFilePath).makePublic();
  return bucket.file(gcsFilePath).publicUrl();
};
