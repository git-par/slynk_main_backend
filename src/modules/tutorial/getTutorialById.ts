import { TutorialModal } from ".";
import { Tutorial } from ".";

/**
 *
 * @param Tutorial class
 * @returns
 */
export const getTutorialById = async (_id: string) => {
  const tutorial = await TutorialModal.findById(_id).lean();
  return tutorial ? new Tutorial(tutorial) : null;
};
