import {
  deleteAgendaTrack,
  getAgendaTrackByName,
} from "../modules/agendaTrack";
import { IUser } from "../modules/user";
import { agendaInstance } from "../server";

export const removeDeleteUserORAccount = async (user: IUser) => {
  const existingAgendaUser = await getAgendaTrackByName(
    `USER_DELETE_${user._id.toString()}`
  );
  const existingJobUser = await agendaInstance.jobs({
    name: `USER_DELETE_${user._id.toString()}`,
  });

  if (existingJobUser && existingJobUser.length) {
    await existingJobUser[0].remove();
    await deleteAgendaTrack(existingAgendaUser._id.toString());
  }

  // if (existingAgendaUser) {
  //   console.log("in 1 ");
  //   agendaInstance.define(
  //     `USER_DELETE_${user._id.toString()}`,
  //     { lockLifetime: 10000 },
  //     async (job: Job) => {
  //       console.log("in job");

  //     }
  //   );
  // }

  for await (const key of user.accounts) {
    const existingAgendaAccount = await getAgendaTrackByName(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      `ACCOUNT_DELETE_${key._id.toString()}`
    );

    const existingJobAccount = await agendaInstance.jobs({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      name: `ACCOUNT_DELETE_${key._id.toString()}`,
    });

    if (existingJobAccount && existingJobAccount.length) {
      await existingJobAccount[0].remove();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      await deleteAgendaTrack(existingAgendaAccount._id.toString());
    }

    // if (existingAgendaAccount) {
    //   agendaInstance.define(
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     //@ts-ignore
    //     `ACCOUNT_DELETE_${key._id.toString()}`,
    //     { lockLifetime: 10000 },
    //     async (job: Job) => {
    //       await job.remove();
    //       await deleteAgendaTrack(existingAgendaUser._id.toString());
    //     }
    //   );
    // }
  }
  return existingAgendaUser ? true : false;
};
