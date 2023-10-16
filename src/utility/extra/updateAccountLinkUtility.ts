import { connectDb } from "../../dbConnection";
import { AccountModel } from "../../modules/account/schema";

const updateAccountLinkUtility = async () => {
  await connectDb().then(async () => {
    const accounts = await AccountModel.find().lean();
    await Promise.all(
      accounts.map((ac) =>
        AccountModel.findByIdAndUpdate(ac._id.toString(), { ...ac, links: [] })
      )
    );
  });
};

updateAccountLinkUtility().then(() => {
  process.exit();
});
