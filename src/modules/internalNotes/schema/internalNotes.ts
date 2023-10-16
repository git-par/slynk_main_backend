import { Schema, model, Types } from "mongoose";
import { IInternalNotes } from "../types";

const internalNotes = new Schema<IInternalNotes>(
    {
        accountId: {
            type: Types.ObjectId,
            ref: "accounts",
            required: true,
        },
        createdBy: {
            type: Types.ObjectId,
            ref: "accounts",
            required: true,
        },
        updatedBy: {
            type: Types.ObjectId,
            ref: "accounts",
            required: true,
        },
        notes: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
)

export const InternalNotesModel = model<IInternalNotes>("internalNotes", internalNotes)