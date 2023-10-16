import { SuspendType, SuspendTypeModal } from ".";
/**
 * 
 * @param suspend id
 * @returns relevant SuspendTypeModal record | null
 */

export const  getSuspendTypeById = async (_id: string) => {
    const suspendType = await SuspendTypeModal.findById(_id);
    return suspendType ? new SuspendType(suspendType) : null;
}