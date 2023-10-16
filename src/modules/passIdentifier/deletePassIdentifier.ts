import { PassIdentifierModel } from ".";

/**
 *
 * @param Identifier id
 * @returns null
 */

export const deletePassIdentifier = async (_id: string) => {
  await PassIdentifierModel.findByIdAndDelete(_id);
  return;
};
