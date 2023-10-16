import { connectDb } from "../../dbConnection";
import {
  Connect,
  getAllConnection,
  getReverseConnection,
  updateConnect,
} from "../../modules/connect";
import * as dotenv from "dotenv";
dotenv.config();

const updateConnectionByMutual = async () => {
  await connectDb()
    .then(async () => {
      const connect = await getAllConnection();
      //   console.log("****************************", connect);
      for await (const item of connect) {
        const accountId = item.account;
        const targetAccountId = item.targetAccount.account;

        const exits = await getReverseConnection({
          account: targetAccountId,
          targetAccount: {
            account: accountId,
          },
        });

        const updatableConnection = new Connect({
          ...item,
          isMutual: exits ? true : false,
        });
        updateConnect(updatableConnection);
        if (exits) {
          const updatableConnectionAgain = new Connect({
            ...exits,
            isMutual: true,
          });
          updateConnect(updatableConnectionAgain);
        }
      }

      //   fs.writeFileSync(
      //     "./exports/getTagsWithNoAccountSuccess.json",
      //     JSON.stringify(success)
      //   );
      //   fs.writeFileSync(
      //     "./exports/getTagsWithNoAccountError.json",
      //     JSON.stringify(error)
      //   );
    })
    .catch((error) => {
      console.log(error);
    });
};

updateConnectionByMutual().then(() => {
  process.exit();
});
