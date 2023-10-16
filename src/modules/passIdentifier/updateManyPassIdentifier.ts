import { PassIdentifierModel } from ".";

/**
 *
 * @param Identifier class
 * @returns updated Identifier Identifier
 */

export const updateManyPassIdentifier = async (
  data: {
    passTypeIdentifier: string;
    serialNumber: string;
  },
  isUpdateRequired: boolean
) => {
  await PassIdentifierModel.updateMany(data, {
    $set: {
      isUpdateRequired,
      lastUpdatedDate: (new Date().getTime() / 1000).toString(),
    },
  });
  return true;
};
