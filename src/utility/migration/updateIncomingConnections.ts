import { connectDb } from "../../dbConnection";
import * as dotenv from "dotenv";
import { IncomingConnectionModel } from "../../modules/incomingConnection/schema";
import * as fs from "fs";
import {
  IncomingConnection,
  updateIncomingConnection,
} from "../../modules/incomingConnection";
dotenv.config();

const updatedIncomingConnection = async () => {
  await connectDb().then(async () => {
    const incomingConnections = await IncomingConnectionModel.find().lean();
    const success = [];
    const error = [];
    await Promise.allSettled(
      incomingConnections.map(async (ac, index) => {
        console.log(index);

        await updateIncomingConnection(
          new IncomingConnection({
            ...ac,
            firstName: ac.firstName ? ac.firstName : "",
            lastName: ac.lastName ? ac.lastName : "",

            phoneNumber: ac.phoneNumber ? ac.phoneNumber : "",

            email: ac.email ? ac.email : "",
            companyName: ac.companyName ? ac.companyName : "",
            role: ac.role ? ac.role : "",
            newRequest: false,
            isSlynkUser:
              ac.account?.toString() === ac.targetAccount.account?.toString()
                ? false
                : true,
            account:
              ac.account?.toString() === ac.targetAccount.account?.toString()
                ? null
                : ac.account?.toString(),
          })
        )
          .then((result) => {
            console.log(result);
            success.push(result);
          })
          .catch((err) => {
            console.log(err);
            error.push(err);
          });
      })
    );
    fs.writeFileSync(
      "./exports/updateIncomingConnectionSuccess.json",
      JSON.stringify(success)
    );

    fs.writeFileSync(
      "./exports/updateIncomingConnectionError.json",
      JSON.stringify(error)
    );
  });
};
IncomingConnection;

updatedIncomingConnection().then(() => {
  process.exit();
});
