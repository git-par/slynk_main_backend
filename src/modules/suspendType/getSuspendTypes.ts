import { SuspendType, SuspendTypeModal } from ".";

export const getSuspendTypes = async () => {
  const suspendTypes = await SuspendTypeModal.find();
  return suspendTypes
    ? suspendTypes.map((item) => new SuspendType(item))
    : null;
};