import { getAccountById } from ".";

export const getAllAccountData = async (_id: string) => {
  const account = await getAccountById(_id);
  return account;
};
