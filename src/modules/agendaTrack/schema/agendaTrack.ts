import { model, Schema, Types } from "mongoose";
import { IAgendaTrack } from "../types";

const agendaTrack = new Schema<IAgendaTrack>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "user",
      default: null,
    },
    accountId: {
      type: Types.ObjectId,
      ref: "account",
      default: null,
    },
    type: {
      type: String,
    },
    agendaName: {
      type: String,
    },
    timeInterval: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const AgendaTrackModel = model<IAgendaTrack>("agendaTrack", agendaTrack);
