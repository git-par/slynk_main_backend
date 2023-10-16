import { get } from "lodash";
import { model, Schema, Types } from "mongoose";
import { ILinks } from "..";
import { Account, getAccountById, updateAccount } from "../../account";
import {
  deleteAccountLinkByLinkId,
  getAccountLinkByLinkId,
} from "../../accountLinks";

const links = new Schema<ILinks>({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  logo: {
    type: String,
    required: false,
  },
  isPro: {
    type: Boolean,
    default: false,
  },
  isDeactive: {
    type: Boolean,
    default: false,
  },
  prefix: {
    type: String,
    default: "",
  },
  suffix: {
    type: String,
    default: "",
  },
  androidPrefix: {
    type: String,
    default: "",
  },
  iosPrefix: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  extraLabel: {
    type: Boolean,
    default: false,
  },
  extraImage: {
    type: Boolean,
    default: false,
  },
  extraPlaceholder: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  length: {
    type: Number,
    default: 15,
  },
  key: {
    type: String,
    default: "",
  },
  category: {
    type: [
      {
        type: Types.ObjectId,
        ref: "links_categories",
      },
    ],
    validate: [minimumCategory, "{PATH} required minimum 1 category"],
    required: true,
  },
  maxLinks: {
    forFreeUser: {
      type: Number,
      default: 1,
    },
    forPaidUser: {
      type: Number,
      default: 1,
    },
  },
  skippedWords: {
    type: [
      {
        type: String,
      },
    ],
  }
}, { timestamps: true });

function minimumCategory(val) {
  return val.length > 0;
}
export const LinksModel = model<ILinks>("links", links);
LinksModel.watch().on("change", async (data) => {
  if (data.operationType !== "delete") {
    return;
  }
  const _id = get(data, "documentKey._id", "").toString();
  if (!_id) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const promises: Promise<any>[] = [];

  const accountLinks = await getAccountLinkByLinkId(_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promises: Promise<any>[] = accountLinks.map((al) => {
    return getAccountById(al.account.toString()).then((account) =>
      updateAccount(
        new Account({
          ...account.toJSON(),
          links: account.links.filter(
            (link) => link.toString() !== al._id.toString()
          ),
        })
      )
    );
  });

  // delete account link
  promises.push(deleteAccountLinkByLinkId(_id));

  await Promise.allSettled(promises);
});
