import { connectDb } from "../../dbConnection";
import * as dotenv from "dotenv";
import { AccountModel } from "../../modules/account/schema";
import { Account, updateAccount } from "../../modules/account";
dotenv.config();

const updatedAccount = async () => {
  await connectDb().then(async () => {
    const accounts = await AccountModel.find().lean();
    await Promise.all(
      accounts.map(async (ac) => {
        console.log(ac._id);

        await updateAccount(
          new Account({
            ...ac,
            type: ac.type === "BUSINESS" ? "PROFESSIONAL" : ac.type,
            // firstName: ac.firstName ? ac.firstName : "",
            // lastName: ac.lastName ? ac.lastName : "",
            // companyName: ac.companyName ? ac.companyName : "",
            // role: ac.role ? ac.role : "",
            // aboutMe: ac.aboutMe ? ac.aboutMe : "",
            // darkMode: ac.darkMode ? ac.darkMode : false,
            // location: ac.location ? ac.location : "",
            // qrColor: ac.qrColor ? ac.qrColor : "#000000",
            // type: ac.type ? ac.type : "PERSONAL",
            // rsb: ac.rsb ? ac.rsb : "",
            // ls: ac.ls ? ac.ls : "",
            // background: ac.background ? ac.background : "",
            // backgroundImage: ac.backgroundImage ? ac.backgroundImage : null,
            // fc: ac.fc ? ac.fc : "",
            // user: ac.user ? ac.user : null,
            // logo: ac.logo ? ac.logo : null,
            // profileImage: ac.profileImage ? ac.profileImage : null,
            // qrImage: ac.qrImage ? ac.qrImage : null,
            // links: ac.links ? ac.links : [],
            // direct: ac.direct ? ac.direct : false,
            // isPrivate: ac.isPrivate ? ac.isPrivate : false,
            // accountName: ac.accountName ? ac.accountName : "",
            // isDeleted: ac.isDeleted ? ac.isDeleted : false,
            // views: ac.views ? ac.views : 0,
            // recentColor: ac.recentColor ? ac.recentColor : [],
            // isDiscoverable: ac.isDiscoverable ? ac.isDiscoverable : true,
            // isVerify: false,
          })
        );
      })
    );
  });
};

updatedAccount().then(() => {
  process.exit();
});
