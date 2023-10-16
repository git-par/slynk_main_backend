import { PassIdentifierModel } from ".";

/**
 *
 * @param PassIdentifier id
 * @returns relevant PassIdentifierModel record | null
 */

export const getPassIdentifierByData = async (data: any) => {
  const passIdentifier = await PassIdentifierModel.find(data);
  return passIdentifier;
};
