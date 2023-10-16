import { get } from "lodash";
import { model, Schema, Types } from "mongoose";
import { getBetaUserById } from "..";

import { IBetaUser } from "../types";

const betaUser = new Schema<IBetaUser>(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    code: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      default: "",
    },
    deleteRequest: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

export const BetaUserModel = model<IBetaUser>("betaUser", betaUser);

BetaUserModel.watch().on("change", async (data) => {
  console.log("********************");
  if (data.operationType !== "delete") {
    return;
  }
  console.log(data);
  const _id = get(data, "documentKey._id", "").toString();
  console.log("===========");
  const betaUser = await getBetaUserById(_id);
  console.log(betaUser);
  if (betaUser) {
    return;
  }
  console.log("**************");
  console.log(betaUser);
  // const user = await getUserByBetaUserId(_id);

  // await deleteUser(user._id);
});
