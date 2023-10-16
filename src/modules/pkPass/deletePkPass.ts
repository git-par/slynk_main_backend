import { Storage } from "@google-cloud/storage";
import { PkPassModel } from "./schema";
import { PkPass } from "./types";
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 *
 * @param pkPass pkPass class
 */
export const deletePkPass = async (pkPass: PkPass) => {
  const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
  await bucket
    .file(`pkPass/${pkPass._id}/${pkPass.url.split("/").pop()}`)
    .delete();
  await PkPassModel.findByIdAndDelete(pkPass._id.toString());
};
