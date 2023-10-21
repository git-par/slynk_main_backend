import { connectDb } from "../../dbConnection";
import { User, getUsers, updateUser } from "../../modules/user";

const dotenv = require("dotenv");
dotenv.config();

const addField = async () => {
  await connectDb();

  const alluser = await getUsers();
  for await (const user of alluser) {
    user.isCancelSub = false;
    await updateUser(new User(user));
  }
  console.log("success");
};
addField();
