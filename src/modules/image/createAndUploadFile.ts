import { Types } from "mongoose";
import { Image } from ".";
import { saveImageToDb } from "./saveImageToDb";
import { uploadFileToGCS } from ".";

interface UploadFileProps {
  filename: string;
  mimeType: string;
  encoding: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createReadStream: any;
}

/**
 *
 * @param file UploadFileProps
 * @param title
 * @param description
 * @returns Image
 */
export const createAndUploadFile = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  file: UploadFileProps | any,
  title: string,
  description: string
): Promise<Image> => {
  const _id = new Types.ObjectId().toString();
  const GCSimageURL = await uploadFileToGCS(
    file.originalname,
    file.filepath,
    _id,
    file.filename
  );
  const image = new Image({
    _id,
    title: title,
    url: GCSimageURL,
    description,
    mimeType: file.mimeType,
  });
  return await saveImageToDb(image);
};
