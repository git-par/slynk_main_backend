import { InternalNotesModel, InternalNotes } from "."

export const getPopInternalNotesById = async (_id: string) => {
    const internalNotes = await InternalNotesModel.findById({ _id })
        .populate({
            path: "createdBy",
            select: "firstName lastName user",
            populate: [
                {
                    path: "user",
                    select: "email phoneNumber isPro"
                }
            ]
        })
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

    return internalNotes ? new InternalNotes(internalNotes) : null
}