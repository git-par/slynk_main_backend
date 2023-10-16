import { Schema, model } from "mongoose";
import { IFeedBackType } from "..";

const feedbackType = new Schema<IFeedBackType>(
  {
    title: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const FeedbackTypeModal = model<IFeedBackType>(
  "feedbackstype",
  feedbackType
);
