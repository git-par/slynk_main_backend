import { AgendaTrack, AgendaTrackModel } from ".";
/**
 *
 * @param Agenda
 * @returns
 */

export const saveAgendaTrack = async (agenda: AgendaTrack) => {
  const agendas = await new AgendaTrackModel(agenda.toJSON()).save();
  return new AgendaTrack(agendas);
};
