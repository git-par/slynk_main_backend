import { SuspendType, SuspendTypeModal } from ".";
/**
 *
 * @param suspendType
 * @returns
 */

export const saveSuspendType = async (suspendType: SuspendType) => {
  const suspendsType = await new SuspendTypeModal(suspendType.toJSON()).save();
  return new SuspendType(suspendsType);
};
