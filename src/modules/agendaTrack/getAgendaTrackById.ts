import { AgendaTrack, AgendaTrackModel } from ".";

/**
 *
 * @param agenda id
 * @returns relevant agendaModal record | null
 */

export const getAgendaTrackById = async (_id: string) => {
  const agenda = await AgendaTrackModel.findById(_id);
  return agenda ? new AgendaTrack(agenda) : null;
};
