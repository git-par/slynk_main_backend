import { get } from "lodash";
import { Schema, model, Types } from "mongoose";
import { genderType } from "../types";
import { getUserById, IUser } from "..";
import { getAccountsByUserId, updateAccount } from "../../account";
// import { deleteBetaUser } from "../../betaUser";
const user = new Schema<IUser>(
  {
    email: {
      type: String,
      // required: true,
    },
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
      // enum: genderType,
    },
    googleId: {
      type: String,
    },
    stripeAccount: {
      type: String,
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    isAdminPro: {
      type: Boolean,
      default: false,
    },
    isInAppPro: {
      type: Boolean,
      default: false,
    },
    isCancelSub: {
      type: Boolean,
      default: false,
    },
    isFreePro: {
      type: Boolean,
      default: false,
    },
    isFreeUsed: {
      type: Boolean,
      default: false,
    },
    googleLogin: {
      type: Boolean,
      default: false,
    },
    appleLogin: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isFirstVisit: {
      visitDate: {
        type: Date,
        default: null,
      },
      value: {
        type: Boolean,
        default: true,
      },
    },
    isBetaFirstVisit: {
      visitDate: {
        type: Date,
        default: null,
      },
      value: {
        type: Boolean,
        default: false,
      },
    },
    isPrivacyAccepted: {
      acceptedDate: {
        type: Date,
        default: null,
      },
      value: {
        type: Boolean,
        default: false,
      },
    },
    phoneNumber: {
      type: String,
    },
    FCMToken: [
      {
        type: String,
      },
    ],
    RESETToken: {
      type: String,
      default: "",
    },
    updateEmailOTP: {
      type: String,
      default: "",
    },
    // betaUser: {
    //   type: Types.ObjectId,
    //   ref: "betausers",
    //   default: null,
    // },
    accounts: [
      {
        type: Types.ObjectId,
        ref: "accounts",
      },
    ],
    userType: {
      type: String,
      default: "User",
    },
    suspend: {
      suspendTill: {
        type: Date,
      },
      suspendMessage: {
        type: String,
      },
    },
    deleteRequest: {
      type: Boolean,
      default: false,
    },
    deActivate: {
      type: "Number",
      default: 0,
    },
    subscriptionTill: {
      type: Date,
      default: null,
    },
    trialEndDate: {
      type: Date,
      default: null,
    },
    pwaShow: {
      type: Boolean,
      default: false,
    },
    dragOff: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("users", user);
UserModel.watch().on("change", async (data) => {
  if (data.operationType !== "delete") {
    return;
  }
  // console.log(data);
  // console.log("===========");
  const _id = get(data, "documentKey._id", "").toString();
  const user = await getUserById(_id);
  console.log(user);
  if (user) {
    return;
  }
  // console.log("**************");
  // console.log(user);

  const accounts = (await getAccountsByUserId(_id)).map((acc) => {
    acc.isDeleted = true;
    return acc;
  });

  // if (user) {
  //   await deleteBetaUser(user.betaUser.toString());
  // }

  await Promise.allSettled(accounts.map(updateAccount));
});
