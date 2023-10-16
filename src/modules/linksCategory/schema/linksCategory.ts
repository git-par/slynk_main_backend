import { model, Schema, Types } from "mongoose";
import { ILinksCategory } from "..";

const linksCategory = new Schema<ILinksCategory>({
  title: {
    type: String,
    unique: true,
  },
  index: {
    type: Number,
  },
  links: [
    {
      type: Types.ObjectId,
      ref: "links",
    },
  ],
},{ timestamps: true });

export const LinksCategoryModel = model<ILinksCategory>(
  "links_categories",
  linksCategory
);
