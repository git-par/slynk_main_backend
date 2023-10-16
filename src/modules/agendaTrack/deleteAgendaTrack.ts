import { AgendaTrackModel } from "./schema";

export const deleteAgendaTrack = async (agendaId: string) => {
  await AgendaTrackModel.findByIdAndDelete(agendaId);
};
