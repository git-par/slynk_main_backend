import { AgendaTrack, AgendaTrackModel } from ".";

export const getAgendaTrackByName = async (agendaName: string) => {
  const agenda = await AgendaTrackModel.findOne({ agendaName });
  return agenda ? new AgendaTrack(agenda) : null;
};
