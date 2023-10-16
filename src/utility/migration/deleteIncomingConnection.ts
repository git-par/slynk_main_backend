import { connectDb } from "../../dbConnection";
import {
  deleteConnect,
  getAllConnection,
  getReverseConnection,
} from "../../modules/connect";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { getAccountById } from "../../modules/account";
import {
  deleteIncomingConnection,
  getAllIncomingConnection,
  getReverseIncomingConnection,
} from "../../modules/incomingConnection";
dotenv.config();

const updateConnection = async () => {
  const success = [];
  const error = [];
  const deleted = [];
  await connectDb()
    .then(async () => {
      const connection = await getAllConnection();

      for await (const item of connection) {
        const accountId = item.account?.toString();
        const targetAccountId = item.targetAccount.account?.toString();

        const exits = await getReverseIncomingConnection({
          account: targetAccountId,
          targetAccount: {
            account: accountId,
          },
        });
        if (exits) {
          if (exits.isSlynkUser) {
            deleted.push(exits);
            await deleteIncomingConnection(exits._id);
          }
        }
        // const exitAcc = await getAccountById(accountId);
        // const exitTargetAcc = await getAccountById(targetAccountId);
        // // console.log(exitAcc, exitTargetAcc);

        // if (exitAcc === null || exitTargetAcc === null) {
        //   deleted.push(item);
        //   await deleteConnect(item._id);
        // } else {
        //   success.push(item);
        // }
      }
      console.log("success", success.length);
      console.log("error", error.length);
      console.log("deleted", deleted.length);

      fs.writeFileSync(
        "./exports/updateIncomingConnectionSuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync(
        "./exports/deletedIncomingConnectionSuccess.json",
        JSON.stringify(deleted)
      );
      fs.writeFileSync(
        "./exports/updateIncomingConnectionError.json",
        JSON.stringify(error)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

updateConnection().then(() => {
  process.exit();
});
