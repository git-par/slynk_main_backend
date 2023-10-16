import { personalConnectionModel } from "./schema";

export const deletePersonalConnectionByAccount = async (account: string) => {
  await personalConnectionModel.deleteMany({ account });
};
