import App from "./app";

import { error as errorLogger } from "winston";
import { connectDb } from "./dbConnection";
import { IIncomingConnection } from "./modules/incomingConnection";
import Agenda from "agenda";
import { getAgendaTrack } from "./modules/agendaTrack";
import { agendaDeleteAccount } from "./helper/agendaDeleteAccount";
import { agendaDeleteUser } from "./helper/agendaDeleteUser";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
dotenv.config();
process.env.TZ = "UTC";
const serverPort = process.env.PORT || 3000;

export const agendaInstance = new Agenda({
  db: { address: process.env.AGENDA_STRING, collection: "agendaJobs" },
  processEvery: "5 seconds",
});

connectDb()
  .then(async () => {
    App.start(serverPort);
    const server = App.instance.listen(serverPort, function () {
      console.log(
        `App listening on environment "${process.env.NODE_ENV}" ${serverPort}`
      );
    });

    const agendaJobs = await getAgendaTrack();

    for await (const value of agendaJobs) {
      if (!value.isCompleted) {
        if (value.type === "ACCOUNT") {
          await agendaDeleteAccount(
            value.accountId.toString(),
            value.type,
            value.startDate
          );
        }
        if (value.type === "USER") {
          await agendaDeleteUser(
            value.userId.toString(),
            value.type,
            value.startDate
          );
        }
      }
    }
    (async function () {
      agendaInstance.on("ready", async (err, job) => {
        console.log("Agenda is ready");
        await agendaInstance.start();
      });

      agendaInstance.on("error", (err, job) => {
        console.log("Agenda error");
        console.log(err);
      });
    })();
    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:3001",
        // credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Connected to socket.io");

      socket.on("setup", (userId) => {
        socket.join(userId);
        //send callback that user connected
        socket.emit("connected", userId);
      });

      socket.on("new request", (newConnection: IIncomingConnection) => {
        if (!newConnection.targetAccount.account)
          return console.log("User not found!");

        socket
          .in(newConnection.targetAccount.account)
          .emit("new request received", newConnection);
      });
    });
  })
  .catch((error) => {
    errorLogger("error while connect to database", error);
  });
