import { TutorialModal } from ".";
import { Tutorial } from ".";

export const getTutorial = async () => {
  const tutorial = await TutorialModal.find().lean();
  return tutorial ? tutorial.map((item) => new Tutorial(item)) : null;
};
