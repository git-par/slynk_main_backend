import { get } from "lodash";
import { model, Schema, Types } from "mongoose";
import {
  AccountLink,
  getAccountLinkByLinksReference,
  IAccountLink,
  updateAccountLink,
} from "..";

const accountLink = new Schema<IAccountLink>(
  {
    link: {
      type: Types.ObjectId,
      ref: "links",
      required: true,
    },
    profileShow: {
      type: Boolean,
      default: true,
    },
    cardShow: {
      type: Boolean,
      default: true,
    },
    displayOnTop: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
    },
    account: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    links: [
      {
        accountLink: {
          type: Types.ObjectId,
          ref: "account_links",
        },
        show: {
          type: Boolean,
          default: true,
        },
      },
    ],
    logo: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    fileValue: {
      type: Types.ObjectId,
      ref: "image",
      default: null,
    },
    fileType: {
      type: String,
    },
    extraTitle: {
      type: String,
      default: "",
    },
    extraDescription: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const AccountLinkModel = model<IAccountLink>(
  "account_links",
  accountLink
);

AccountLinkModel.watch().on("change", async (data) => {
  if (data.operationType !== "delete") {
    return;
  }
  const _id = get(data, "documentKey._id", "").toString();
  if (!_id) {
    return;
  }

  // already remove reference from  link delete
  const accountLinks = await getAccountLinkByLinksReference(_id);
  await Promise.allSettled(
    accountLinks.map((accountLink) =>
      updateAccountLink(
        new AccountLink({
          ...accountLink.toJSON(),
          links: accountLink.links.filter(
            (al) => al.accountLink.toString() !== _id
          ),
        })
      )
    )
  );
});
