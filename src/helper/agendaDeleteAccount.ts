import { agendaInstance } from "../server";
import { Job } from "agenda";
import {
  AgendaTrack,
  deleteAgendaTrack,
  getAgendaTrackByName,
  saveAgendaTrack,
} from "../modules/agendaTrack";
import { getAccountById, updateAccount } from "../modules/account";
import { Account as AccountType } from "../modules/account";
import { getUserById, updateUser, User } from "../modules/user";

export const agendaDeleteAccount = async (
  accountId: string,
  type: string, // USER || ACCOUNT
  startDate: Date
) => {
  if (!accountId || type !== "ACCOUNT") throw new Error("Invalid Account.");

  agendaInstance.define(
    `${type}_DELETE_${accountId}`,
    { lockLifetime: 10000 },
    async (job: Job) => {
      if (!accountId) {
        throw new Error("Invalid Account.");
      }

      const account = await getAccountById(accountId);
      if (!account) {
        throw new Error("Invalid Account.");
      }

      if (account.type === "PERSONAL") {
        throw new Error("You can not delete your PERSONAL account.");
      }

      await updateAccount(
        new AccountType({ ...account.toJSON(), isDeleted: true })
      );
      const user = await getUserById(account.user.toString());
      updateUser(
        new User({
          ...user.toJSON(),
          accounts: user.accounts.filter((acc) => acc.toString() !== accountId),
        })
      );
      await job.remove();
      console.log("Successfully removed job from collection");
      const existingAgenda = await getAgendaTrackByName(job.attrs.name);

      await deleteAgendaTrack(existingAgenda._id.toString());
    }
  );

  (async function () {
    const existingJob = await agendaInstance.jobs({
      name: `${type}_DELETE_${accountId}`,
    });
    const job: Job = agendaInstance.create(`${type}_DELETE_${accountId}`, {
      accountId,
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
                accountId,
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
