import { agendaInstance } from "../server";
import { Job } from "agenda";
import {
  AgendaTrack,
  getAgendaTrackByName,
  deleteAgendaTrack,
  saveAgendaTrack,
} from "../modules/agendaTrack";
import { deleteUser, getUserById } from "../modules/user";

export const agendaDeleteUser = async (
  userId: string,
  type: string, // USER || ACCOUNT
  startDate: Date
) => {
  if (!userId || type !== "USER") throw new Error("Invalid User.");

  agendaInstance.define(
    `${type}_DELETE_${userId}`,
    { lockLifetime: 10000 },
    async (job: Job) => {
      if (!userId) {
        throw new Error("Invalid User.");
      }

      const user = await getUserById(userId);
      if (!user) {
        throw new Error("Invalid User.");
      }

      await deleteUser(userId);

      await job.remove();
      console.log("Successfully removed job from collection");
      const existingAgenda = await getAgendaTrackByName(job.attrs.name);

      await deleteAgendaTrack(existingAgenda._id.toString());
    }
  );

  (async function () {
    const existingJob = await agendaInstance.jobs({
      name: `${type}_DELETE_${userId}`,
    });
    const job: Job = agendaInstance.create(`${type}_DELETE_${userId}`, {
      userId,
    });
    await agendaInstance.start();
    job.repeatEvery("30 days", {
      skipImmediate: false,
    });
    if (existingJob && !existingJob.length) {
      job
        .schedule(startDate)
        .save()
        .then(async (data) => {
          const jobData = data.attrs;
          const existingAgenda = await getAgendaTrackByName(jobData.name);

          if (!existingAgenda) {
            await saveAgendaTrack(
              new AgendaTrack({
                type,
                userId,
                agendaName: jobData.name,
                timeInterval: jobData.repeatInterval,
                isCompleted: false,
                startDate,
              })
            );
          }
        });
    }
  })();
};
