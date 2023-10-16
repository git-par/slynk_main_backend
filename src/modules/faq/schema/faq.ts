import { Schema, model } from "mongoose";
import { IFaq } from "..";

const faq = new Schema<IFaq>(
  {
    title: {
      type: String,
    },
    embeddedLink: {
      type: String,    
      default: null,
    },
    description: {
      type: String,      
      default: "",
    },
  },
  { timestamps: true }
);

export const FaqModal = model<IFaq>("faq", faq);
