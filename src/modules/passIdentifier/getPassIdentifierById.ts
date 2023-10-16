import { PassIdentifier, PassIdentifierModel } from ".";

/**
 * 
 * @param PassIdentifier id
 * @returns relevant PassIdentifierModel record | null
 */

export const  getPassIdentifierById = async (_id: string) => {
    const passIdentifier = await PassIdentifierModel.findById(_id);
    return passIdentifier ? new PassIdentifier(passIdentifier) : null;
}