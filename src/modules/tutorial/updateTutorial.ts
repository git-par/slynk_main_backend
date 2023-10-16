import { TutorialModal } from ".";
import { Tutorial } from ".";

/**
 *
 * @param Tutorial class
 * @returns
 */

export const updateTutorial = async (tutorial: Tutorial) => {
  await TutorialModal.findByIdAndUpdate(tutorial._id, tutorial.toJSON());
  return tutorial;
};
