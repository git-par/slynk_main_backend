import { ImageModel } from "./schema";
import { Image } from ".";
// import { ImageModel } from "../image/schema";

/**
 *
 * @param tag id
 * @returns relevant tag record | null
 */

export const getImage = async () => {
  const tag = await ImageModel.find();
  // .populate({ path: "tagImage", model: ImageModel });
  return tag ? tag.map((item) => new Image(item)) : null;
};
