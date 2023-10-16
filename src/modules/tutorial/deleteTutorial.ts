import { TutorialModal } from "./schema";

/**
 * @param _id
 * delete Tutorial by _id
 */
export const deleteTutorial = async (_id: string) => {
  await TutorialModal.findByIdAndDelete(_id);
};
