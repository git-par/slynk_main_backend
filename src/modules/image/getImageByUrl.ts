import { Image } from ".";
import { ImageModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant image
 */
export const getImageByUrl = async (url: string) => {
  const image = await ImageModel.findOne({ url });
  return image ? new Image(image) : null;
};
