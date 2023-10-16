import { get } from "lodash";
import { model, Schema, Types } from "mongoose";
import { getConnectById, handelConnectDelete, IConnect } from "..";

const connect = new Schema<IConnect>(
  {
    account: {
      type: Types.ObjectId,
      ref: "accounts",
    },
    image: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    isSlynkUser: {
      type: Boolean,
    },
    isMutual: {
      type: Boolean,
      default: false,
    },
    targetAccount: {
      account: {
        type: Types.ObjectId,
        ref: "accounts",
      },
      show: {
        type: Boolean,
        default: false,
      },
    },
    userData: [
      {
        label: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
    newRequest: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export const ConnectModel = model<IConnect>("connect", connect);

ConnectModel.watch().on("change", async (data) => {
  if (data.operationType !== "delete") {
    return;
  }
  console.log(data);
  console.log("===========");
  const _id = get(data, "documentKey._id", "").toString();
  const connect = await getConnectById(_id);
  if (connect) {
    return;
  }
  await handelConnectDelete(_id);
});
