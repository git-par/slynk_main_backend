import { model, Schema, Types } from "mongoose";
import { IIncomingConnection } from "../type/incomingConnection";

const incommingconnect = new Schema<IIncomingConnection>(
  {
    account: {
      type: Types.ObjectId,
      ref: "accounts",
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
    newRequest: {
      type: Boolean,
      default: true,
    },
    isSlynkUser: {
      type: Boolean,
    },
  },
  { timestamps: true }
);
export const IncomingConnectionModel = model<IIncomingConnection>(
  "incomingconnection",
  incommingconnect
);
