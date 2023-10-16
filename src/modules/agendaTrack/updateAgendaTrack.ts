import { AgendaTrackModel } from "./schema";
import { AgendaTrack } from "./types";

export const updateAgendaTrack = async (agendaTracks: AgendaTrack) => {
  await AgendaTrackModel.findByIdAndUpdate(agendaTracks._id, agendaTracks.toJSON());
  return agendaTracks;
};
