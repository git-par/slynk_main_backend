import { InternalNotesModel, InternalNotes } from "."

export const getPopInterNotesByAccountId = async (accountId: string) => {
    const internalNotes = await InternalNotesModel.find({ accountId })
        .populate({
            path: "createdBy",
            select: "firstName lastName user",
            populate: [
                {
                    path: "user",
                    select: "email phoneNumber isPro"
                }
            ]
        }).lean()
        .populate({
            path: "updatedBy",
            select: "firstName lastName user",
            populate: [
                {
                    path: "user",
                    select: "email phoneNumber isPro"
                }
            ]
        }).lean()

    return internalNotes ? internalNotes.map((item) => new InternalNotes(item)) : null
}