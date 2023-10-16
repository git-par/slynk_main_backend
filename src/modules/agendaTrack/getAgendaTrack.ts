import { AgendaTrack, AgendaTrackModel } from ".";


export const getAgendaTrack = async () => {
  const agenda = await AgendaTrackModel.find();
  return agenda ? agenda.map((item) => new AgendaTrack(item)) : null;
};
