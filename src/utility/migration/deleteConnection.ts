import { connectDb } from "../../dbConnection";
import { deleteConnect, getAllConnection } from "../../modules/connect";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { getAccountById } from "../../modules/account";
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

        const exitAcc = await getAccountById(accountId);
        const exitTargetAcc = await getAccountById(targetAccountId);
        // console.log(exitAcc, exitTargetAcc);

        if (exitAcc === null || exitTargetAcc === null) {
          // if (item.isSlynkUser) {
            deleted.push(item);
            // await deleteConnect(item._id);
          // }
        } else {
          success.push(item);
        }
      }
      console.log("success", success.length);
      console.log("error", error.length);
      console.log("deleted", deleted.length);

      fs.writeFileSync(
        "./exports/updateConnectionSuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync(
        "./exports/deletedConnectionSuccess.json",
        JSON.stringify(deleted)
      );
      fs.writeFileSync(
        "./exports/updateConnectionError.json",
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
