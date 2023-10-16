import { PassIdentifier, PassIdentifierModel } from ".";

/**
 *
 * @param Identifier class
 * @returns updated Identifier Identifier
 */

export const updatePassIdentifier = async (passIdentifier: PassIdentifier) => {
  await PassIdentifierModel.findByIdAndUpdate(
    passIdentifier._id,
    passIdentifier.toJSON()
  );
  return passIdentifier;
};
