import { SuspendType, SuspendTypeModal } from ".";
/**
 *
 * @param suspend class
 * @returns updated suspend record
 */

export const updateSuspendType = async (suspendType: SuspendType) => {
    // console.log(suspendType,"llllllllll")
  await SuspendTypeModal.findByIdAndUpdate(suspendType._id, suspendType.toJSON());
  return suspendType;
};
