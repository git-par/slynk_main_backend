import { Tutorial } from ".";
import { TutorialModal } from "./schema";

/**
 *
 * @param Tutorial Tutorial class
 * @returns created Tutorial
 */
export const saveTutorial = async (tutorial: Tutorial) => {
  await new TutorialModal(tutorial.toJSON()).save();
  return tutorial;
};
