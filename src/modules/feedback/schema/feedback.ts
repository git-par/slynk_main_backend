import { Schema, model, Types } from "mongoose";
import { IFeedBack } from "..";

const feedback = new Schema<IFeedBack>(
  {
    email: {
      type: String,
      required: true,
    },
    messageType: {
      type: Types.ObjectId,
      ref: "feedbackstype",
      required: true,
    },
    accountId: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    responseType: {
      type: Boolean,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
    },
    isArchived: {
      type: Boolean,
      required: false,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachment: [
      {
        type: Types.ObjectId,
        ref: "image",
        default: [],
      },
    ],
  },

  { timestamps: true }
);

export const FeedbackModal = model<IFeedBack>("feedbacks", feedback);
