import { Tag } from ".";
import { Account } from "../account";
import { TagModel } from "./schema";

export const getTagByUrl = async (urlName: string) => {
  const tag = await TagModel.findOne({ urlName })
    .populate({
      path: "account",
      select: Account.shortFields,
      // select: Account.publicFields,
      populate: [
        {
          path: "profileImage",
        },
        //   {
        //     path: "logo",
        //   },
        //   {
        //     path: "qrImage",
        //   },
        {
          path: "user",
          select: "isPro",
        },
        //   {
        //     path: "links",

        //     populate: [{ path: "link" }, { path: "fileValue" }
        //     ],
        //   },
      ],
    })
    .populate({
      path: "tagImage",
    })
    .lean();

  return tag ? new Tag(tag) : null;
};
