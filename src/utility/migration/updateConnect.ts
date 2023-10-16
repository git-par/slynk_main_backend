import { connectDb } from "../../dbConnection";
import * as dotenv from "dotenv";
import { ConnectModel } from "../../modules/connect/schema";
import * as fs from "fs";
import {
  Connect,
  getReverseConnection,
  updateConnect,
} from "../../modules/connect";
dotenv.config();

const updatedConnect = async () => {
  await connectDb().then(async () => {
    const connects = await ConnectModel.find().lean();
    const success = [];
    const aa = [];
    const error = [];
    await Promise.allSettled(
      connects.map(async (ac) => {
        // console.log(ac._id);
        const accountId = ac.account;
        const targetAccountId = ac.targetAccount.account;

        const exits = await getReverseConnection({
          account: targetAccountId,
          targetAccount: {
            account: accountId,
          },
        });
        aa.push({
          accountId,
          targetAccountId,
        });
        await updateConnect(
          new Connect({
            ...ac,
            firstName: ac.firstName ? ac.firstName : "",
            lastName: ac.lastName ? ac.lastName : "",

            phoneNumber: ac.phoneNumber ? ac.phoneNumber : "",

            email: ac.email ? ac.email : "",
            companyName: ac.companyName ? ac.companyName : "",
            role: ac.role ? ac.role : "",
            newRequest: false,
            isSlynkUser:
              ac.account.toString() === ac.targetAccount.account.toString() ||
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              !ac.targetAccount.account
                ? false
                : true,
            targetAccount: {
              account:
                targetAccountId?.toString() === accountId?.toString()
                  ? null
                  : targetAccountId,
              show: ac.targetAccount.show ? ac.targetAccount.show : false,
            },
            isMutual: exits ? true : false,
          })
        )
          .then((result) => {
            success.push(result);
          })
          .catch((err) => {
            console.log(err);
            error.push(err);
          });
      })
    );
    console.log("success", success.length);
    console.log("error", error.length);
    console.log("aa", aa.length);
    fs.writeFileSync(
      "./exports/updateConnectSuccess.json",
      JSON.stringify(success)
    );

    fs.writeFileSync(
      "./exports/updateConnectError.json",
      JSON.stringify(error)
    );

    fs.writeFileSync("./exports/aa.json", JSON.stringify(aa));
  });
};
Connect;

updatedConnect().then(() => {
  process.exit();
});
