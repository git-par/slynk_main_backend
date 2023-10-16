import { Types } from "mongoose";
import { savePkPassToDb } from "./savePkPassToDb";
import { PkPass } from "./types";
import { uploadPkPassToGCS } from "./uploadPkPassToGCS";

/*
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns PkPass
 */
export const createAndUploadPkPass = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalname: string,
  filepath: string,
  accountId: string
): Promise<PkPass> => {
  const _id = new Types.ObjectId().toString();
  const GCSpkPassURL = await uploadPkPassToGCS(originalname, filepath, _id);
  const pkPass = new PkPass({
    _id,
    accountId: accountId,
    url: GCSpkPassURL,
  });
  return await savePkPassToDb(pkPass);
};
