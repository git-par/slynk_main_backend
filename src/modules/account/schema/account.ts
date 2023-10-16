import { get } from "lodash";
import { model, Schema, Types } from "mongoose";
import { deleteAccount, getAccountById, IAccount } from "..";
import { deleteAccountLinkByAccountId } from "../../accountLinks";
// import { deleteBetaUser } from "../../betaUser";
import { deleteConnectsBasedOnAccountRef } from "../../connect";
import { deleteGroupByOwnerId } from "../../group";
import { deleteICBasedOnAccountRef } from "../../incomingConnection";
import { deletePersonalConnectionByAccount } from "../../personalConnection";
import { Tag, updateTags } from "../../tags";
import { getTagsByAccountId } from "../../tags/getTagsByAccountId";
import { deleteUser, getUserByAccountId, User } from "../../user";

const account = new Schema<IAccount>(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
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
    aboutMe: {
      type: String,
      default: "",
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    qrColor: {
      type: String,
      default: "#000000",
    },
    type: {
      type: String,
      default: "PERSONAL",
    },
    rsb: {
      type: String,
      default: "",
    },
    ls: {
      type: String,
      default: "",
    },
    background: {
      type: String,
      default: "",
    },
    backgroundImage: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    fc: {
      type: String,
      default: "",
    },
    user: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    logo: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    profileImage: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    qrImage: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    links: [
      {
        type: Types.ObjectId,
        ref: "account_links",
      },
    ],
    direct: {
      type: Boolean,
      default: false,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    accountName: {
      type: String,
    },
    isDeleted: {
      type: "Boolean",
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    recentColor: [
      {
        type: String,
      },
    ],
    isDiscoverable: {
      type: Boolean,
      default: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    qrBg: {
      type: String,
      default: "#ffffff",
    },
    isArchive: {
      type: Boolean,
      default: false,
    },
    googleWalletPicId: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    dragOff: {
      type: Boolean,
      default: true,
    },
    // personalConnection: [
    //   {
    //     type: Types.ObjectId,
    //     ref: "personal_connection",
    //     autopopulate: true,
    //   },
    // ],
  },
  { timestamps: true }
);
export const AccountModel = model<IAccount>("accounts", account);
AccountModel.watch().on("change", async (data) => {
  // console.log(data);
  // console.log("===========");
  const isDeleted = get(
    data,
    "updateDescription.updatedFields.isDeleted",
    false
  );
  const _id = get(data, "documentKey._id", "").toString();
  if (!isDeleted) {
    return;
  }

  if (!_id) {
    return;
  }

  const acc = await getAccountById(_id);
  if (!acc) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises: Promise<any>[] = [];

  const tags: Tag[] = await getTagsByAccountId(_id);
  const user: User = await getUserByAccountId(_id);

  promises.push(deleteAccount(_id));

  // delete or update account related data

  // remove account tag
  promises.push(
    ...tags.map((tag) =>
      updateTags(new Tag({ ...tag.toJSON(), account: null }))
    )
  );

  // update or remove user

  // delete account links
  promises.push(deleteAccountLinkByAccountId(_id));

  // delete account connects
  promises.push(deleteConnectsBasedOnAccountRef(_id));

  // delete group
  promises.push(deleteGroupByOwnerId(_id));

  // incoming connection
  promises.push(deleteICBasedOnAccountRef(_id));

  // personal connection
  promises.push(deletePersonalConnectionByAccount(_id));
  if (user) {
    if (user.accounts && user.accounts.length < 2) {
      promises.push(deleteUser(user._id));
      // if (user.betaUser) {
      //   promises.push(deleteBetaUser(user.betaUser.toString()));
      // }
    }
  }
  await Promise.allSettled(promises);
});

account.index(
  {
    firstName: "text",
    lastName: "text",
    companyName: "text",
    role: "text",
    location: "text",
  },
  {
    weights: {
      firstName: 10,
      lastName: 10,
      companyName: 5,
      role: 5,
      location: 1,
    },
    name: "TextIndex",
  }
);

AccountModel.createIndexes();
