import { Schema, model } from "mongoose";
import { ITutorial } from "..";

const tutorial = new Schema<ITutorial>(
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

export const TutorialModal = model<ITutorial>("tutorial", tutorial);
