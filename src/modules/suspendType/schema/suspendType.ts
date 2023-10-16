import { Schema, model } from "mongoose";
import { ISuspendType } from "..";

const suspendType = new Schema<ISuspendType>(
  {
    reason: {
      type: String,
      required: true,
    },
  },
   { timestamps: true }
);

export const SuspendTypeModal = model<ISuspendType>(
  "suspendstype",
  suspendType
);
