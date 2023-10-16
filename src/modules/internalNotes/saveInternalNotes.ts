import { InternalNotesModel } from "./schema";
import { InternalNotes } from "./types";

/**
 * 
 * @param internalNotes class
 * @returns 
 */


export const saveInternalNotes = async (internalNotes: InternalNotes) => {
    await new InternalNotesModel(internalNotes.toJSON()).save()
    return internalNotes
}