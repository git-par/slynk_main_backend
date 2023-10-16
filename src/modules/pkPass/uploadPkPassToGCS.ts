// import { log } from "winston";

import { Storage } from "@google-cloud/storage";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

export const uploadPkPassToGCS = async (
  fileName: string,
  filePath: string,
  _id: string
): Promise<string> => {
  const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
  // const gcsFilePath = `pkPass/${_id}/${fileName}.${name.split(".").pop()}`;
  const gcsFilePath = `pkPass/${_id}/${fileName}`;
  const file = bucket.file(gcsFilePath);

  await bucket.upload(filePath, {
    destination: file,
  });

  // await bucket.file(gcsFilePath).makePublic();
  // return bucket.file(gcsFilePath).publicUrl();
  return gcsFilePath;
};
