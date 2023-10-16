import { Image } from ".";
import { ImageModel } from "./schema";

/**
 *
 * @param Image
 * @returns update Image record
 */
export const updateImage = async (image: Image) => {
  await ImageModel.findByIdAndUpdate(image._id, image.toJSON());
  return image;
};
