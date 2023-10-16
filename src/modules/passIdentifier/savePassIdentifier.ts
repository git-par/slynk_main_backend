import { PassIdentifier, PassIdentifierModel } from ".";

/**
 *
 * @param PassIdentifier identifier class
 * @returns created identifier
 */

export const savePassIdentifier = async (passIdentifier: PassIdentifier) => {
  const identifiers = await new PassIdentifierModel(
    passIdentifier.toJSON()
  ).save();
  return new PassIdentifier(identifiers);
};
