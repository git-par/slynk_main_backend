import { Connect } from "../connect";
import { ConnectModel } from "../connect/schema";


/**
 * 
 * @param connectionIds 
 * @returns 
 */
export const getConnectByIds = async (connectIds: string[]) => {
  const connects = await ConnectModel.find({ _id: { $in: connectIds } }).lean();
  return connects.map((ac) => new Connect(ac));
};
