import { model, Schema, Types } from "mongoose";
import { IGroup } from "..";
import { MAX_GROUP_ACCOUNT } from "../../../constant";
const group = new Schema<IGroup>({
  title: {
    type: String,
    required: true,
  },
  owner: {
    type: Types.ObjectId,
    ref: "accounts",
  },
  connects: {
    type: [
      {
        type: Types.ObjectId,
        ref: "connect",
      },
    ],
    validate: [maxAccounts, `{PATH} can add maximum ${MAX_GROUP_ACCOUNT}`],
    required: true,
  },
  // personalConnection: {
  //   type: [
  //     {
  //       type: Types.ObjectId,
  //       ref: "personal_connection",
  //     },
  //   ],
  //   validate: [maxAccounts, `{PATH} can add maximum ${MAX_GROUP_ACCOUNT}`],
  //   required: true,
  // },
},{ timestamps: true });
export const groupModel = model<IGroup>("group", group);

function maxAccounts(val) {
  return val.length < 100;
}
