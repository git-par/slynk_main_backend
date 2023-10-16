import { PassIdentifier, PassIdentifierModel } from ".";

/**
 *
 * @param PassIdentifier id
 * @returns relevant PassIdentifierModel record | null
 */

export const getOnePassIdentifierByData = async (data: any) => {
  const passIdentifier = await PassIdentifierModel.findOne(data);
  return passIdentifier ? new PassIdentifier(passIdentifier) : null;
};
